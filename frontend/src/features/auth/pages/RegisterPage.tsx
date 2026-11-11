import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { errorCampo } from '../../../shared/utils/errorCampo'
import { useAuthStore } from '../../../store/authStore'
import { registrar } from '../api/authApi'
import { registerSchema } from '../types/schemas'

const campos = [
  { name: 'username', label: 'Usuario', type: 'text', auto: 'username' },
  { name: 'full_name', label: 'Nombre completo', type: 'text', auto: 'name' },
  { name: 'email', label: 'Email', type: 'email', auto: 'email' },
  { name: 'password', label: 'Contraseña', type: 'password', auto: 'new-password' },
] as const

export function RegisterPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const navigate = useNavigate()

  const mutacion = useMutation({
    mutationFn: registrar,
    onSuccess: () => {
      toast.success('Cuenta creada. Ya podés ingresar.')
      navigate('/login')
    },
    onError: (error) => toast.error(handleApiError(error)),
  })

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    validators: { onSubmit: registerSchema },
    onSubmit: async ({ value }) => {
      await mutacion.mutateAsync(value).catch(() => undefined)
    },
  })

  if (usuario) return <Navigate to="/" replace />

  return (
    <Card className="mx-auto mt-8 max-w-md p-8">
      <h1 className="mb-6 text-2xl font-bold">Crear cuenta</h1>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        {campos.map((c) => (
          <form.Field key={c.name} name={c.name}>
            {(field) => (
              <Input
                id={c.name}
                type={c.type}
                label={c.label}
                autoComplete={c.auto}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={errorCampo(field.state.meta.errors)}
              />
            )}
          </form.Field>
        ))}
        <Button type="submit" cargando={mutacion.isPending}>
          Registrarme
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-tinta-suave">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-semibold text-tomate">
          Ingresá
        </Link>
      </p>
    </Card>
  )
}
