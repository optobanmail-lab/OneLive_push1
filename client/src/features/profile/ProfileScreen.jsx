import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import useHabitStore from '../../store/useHabitStore'
import useUserStore from '../../store/useUserStore'

function ProfileScreen() {
    const user = useUserStore((state) => state.user)
    const setAge = useUserStore((state) => state.setAge)
    const habits = useHabitStore((state) => state.habits)

    const total = habits.length
    const completed = habits.filter((habit) => habit.completed).length

    return (
        <div className="pt-4">
            <Header
                title="Профиль"
                subtitle="Твои данные и краткая статистика"
            />

            <Card className="mb-4">
                <div className="flex items-center gap-4">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt="avatar"
                            className="h-16 w-16 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface2 text-xl font-bold">
                            {user.firstName?.[0] || 'U'}
                        </div>
                    )}

                    <div>
                        <p className="text-lg font-semibold">{user.firstName}</p>
                        <p className="text-sm text-muted">@{user.username}</p>
                    </div>
                </div>
            </Card>

            <Card className="mb-4">
                <p className="mb-2 text-sm text-muted">Возраст</p>
                <input
                    type="number"
                    value={user.age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Введите возраст"
                    className="w-full rounded-2xl border border-border bg-surface2 px-4 py-3 text-text outline-none"
                />
            </Card>

            <div className="grid grid-cols-2 gap-3">
                <Card>
                    <p className="text-sm text-muted">Привычек</p>
                    <p className="mt-2 text-2xl font-bold">{total}</p>
                </Card>

                <Card>
                    <p className="text-sm text-muted">Выполнено</p>
                    <p className="mt-2 text-2xl font-bold">{completed}</p>
                </Card>
            </div>
        </div>
    )
}

export default ProfileScreen