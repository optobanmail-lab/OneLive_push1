from pydantic import BaseModel


class UserOut(BaseModel):
    id: int
    telegram_id: int
    username: str
    first_name: str
    photo_url: str

    model_config = {"from_attributes": True}