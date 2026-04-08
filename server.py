from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Разрешаем фронтенду (Mini App) обращаться к бэкенду
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class DailyData(BaseModel):
    habits_ratio: float  # от 0.0 до 1.0 (процент выполненных привычек)
    spending: int        # траты в тенге
    streak_days: int     # текущий стрик

@app.post("/calculate-score")
async def calculate_score(data: DailyData):
    # Логика трат: лимит 5000 тенге. Если больше — балл падает.
    spending_score = 1.0 if data.spending <= 5000 else max(0, 1 - (data.spending - 5000) / 10000)

    # Логика стрика: прогресс до 30 дней
    streak_score = min(1.0, data.streak_days / 30)

    # Твоя формула
    final_score = (data.habits_ratio * 0.55) + (spending_score * 0.30) + (streak_score * 0.15)

    return {
        "discipline_score": round(final_score * 100, 1),
        "status": "Elite" if final_score > 0.8 else "Developing"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)