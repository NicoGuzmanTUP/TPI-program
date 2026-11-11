import { useForm } from '@tanstack/react-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { errorCampo } from '../../../shared/utils/errorCampo'
import { useAuthStore } from '../../../store/authStore'
import { loginSchema } from '../types/schemas'

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const usuario = useAuthStore((s) => s.usuario)
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: { username: '', password: '' },
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      try {
        await login(value.username, value.password)
        const actual = useAuthStore.getState().usuario
        toast.success('¡Bienvenido!')
        navigate(actual?.role === 'admin' ? '/admin' : '/', { replace: true })
      } catch (error) {
        toast.error(handleApiError(error))
      }
    },
  })

  if (usuario) return <Navigate to="/" replace />

  return (
    <Card className="mx-auto mt-8 max-w-md p-8">
      <h1 className="mb-6 text-2xl font-bold">Ingresar</h1>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field name="username">
          {(field) => (
            <Input
              id="username"
              label="Usuario o email"
              autoComplete="username"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorCampo(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <Input
              id="password"
              type="password"
              label="Contraseña"
              autoComplete="current-password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorCampo(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(enviando) => (
            <Button type="submit" cargando={enviando}>
              Ingresar
            </Button>
          )}
        </form.Subscribe>
      </form>
      <p className="mt-4 text-center text-sm text-tinta-suave">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="font-semibold text-tomate">
          Registrate
        </Link>
      </p>
    </Card>
  )
}
