import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import ProgressBar from '../../components/ui/ProgressBar'
import useHabitStore from '../../store/useHabitStore'
import useUserStore from '../../store/useUserStore'

function levelClass(done, total) {
    if (!total || done === 0) return 'bg-surface2'
    const pct = done / total
    if (pct >= 0.9) return 'bg-accent'
    if (pct >= 0.6) return 'bg-accent2'
    if (pct >= 0.3) return 'bg-accent2/60'
    return 'bg-accent2/30'
}

function LifeScreen() {
    const user = useUserStore((s) => s.user)
    const getTodayStats = useHabitStore((s) => s.getTodayStats)
    const getRhythm28Days = useHabitStore((s) => s.getRhythm28Days)

    const { total, done } = getTodayStats()
    const progress = total > 0 ? Math.round((done / total) * 100) : 0
    const rhythm = getRhythm28Days()

    return (
        <div className="pt-4">
            <Header
                title={`Привет, ${user.firstName || 'Guest'}`}
                subtitle="Жизнь — это ритм. Держи темп каждый день."
            />

            <Card className="mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted">Прогресс за сегодня</p>
                        <h3 className="mt-2 text-3xl font-bold">{progress}%</h3>
                    </div>
                    <div className="rounded-2xl bg-surface2 px-4 py-3 text-right">
                        <p className="text-xs text-muted">Выполнено</p>
                        <p className="mt-1 text-lg font-semibold">
                            {done}/{total}
                        </p>
                    </div>
                </div>

                <div className="mt-4">
                    <ProgressBar value={progress} />
                </div>

                {total === 0 ? (
                    <p className="mt-3 text-sm text-muted">
                        Добавь привычки — и тут появится твой ритм жизни.
                    </p>
                ) : null}
            </Card>

            <Card className="mb-4">
                <p className="mb-3 text-sm text-muted">Ритм жизни (28 дней)</p>

                <div className="grid grid-cols-7 gap-2">
                    {rhythm.map((d) => (
                        <div
                            key={d.key}
                            title={`${d.key}: ${d.done}/${d.total}`}
                            className={`aspect-square rounded-md ${levelClass(d.done, d.total)}`}
                        />
                    ))}
                </div>

                <p className="mt-3 text-xs text-muted">
                    Чем ярче квадрат — тем больше привычек выполнено в этот день.
                </p>
            </Card>

            <div className="grid grid-cols-2 gap-3">
                <Card>
                    <p className="text-sm text-muted">Привычек сегодня</p>
                    <p className="mt-2 text-2xl font-bold">{total}</p>
                </Card>

                <Card>
                    <p className="text-sm text-muted">Выполнено сегодня</p>
                    <p className="mt-2 text-2xl font-bold">{done}</p>
                </Card>
            </div>
        </div>
    )
}

export default LifeScreen