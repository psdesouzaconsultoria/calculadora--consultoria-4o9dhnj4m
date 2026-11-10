import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { BrandLogo } from '@/lib/brand'

export default function Login() {
  const { login, requestPasswordReset } = useAuth()
  const { toast } = useToast()

  const [isResetMode, setIsResetMode] = useState(false)
  const [email, setEmail] = useState('psdesouzaconsultoria@gmail.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [resetSent, setResetSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      if (isResetMode) {
        if (!email) {
          setErrorMsg('Informe o e-mail cadastrado.')
          setLoading(false)
          return
        }
        await requestPasswordReset(email)
        setResetSent(true)
        toast({
          title: 'E-mail de recuperação enviado',
          description: 'Verifique sua caixa de entrada com as instruções para redefinir sua senha.',
        })
      } else {
        if (!email || !password) {
          setErrorMsg('Preencha seu e-mail e senha para continuar.')
          setLoading(false)
          return
        }
        await login(email, password)
        toast({
          title: 'Login efetuado com sucesso',
          description: 'Bem-vindo à Calculadora RT360 v3!',
        })
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg(
        isResetMode
          ? 'Não foi possível enviar o e-mail de recuperação. Verifique se o endereço está correto.'
          : 'E-mail ou senha inválidos. Por favor, tente novamente.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-navy p-4 relative overflow-hidden">
      {/* Filete dourado decorativo no topo, como no logo */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-gold" aria-hidden="true" />
      <div
        className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <BrandLogo className="mx-auto h-28 w-auto rounded-xl shadow-lg mb-5" />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Calculadora RT360 <span className="text-brand-gold text-sm font-semibold">v3.0</span>
          </h1>
          <p className="text-sm text-white/70 mt-1.5">
            Metodologia RTE para Reforma Tributária: Diagnóstico, Consultoria e Comitê
          </p>
        </div>

        <Card className="border-border/80 shadow-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">
              {isResetMode ? 'Recuperar Senha' : 'Entrar no Sistema'}
            </CardTitle>
            <CardDescription>
              {isResetMode
                ? 'Digite o e-mail associado à sua conta para receber o link de redefinição.'
                : 'Acesse com seu e-mail e senha para gerenciar propostas e parâmetros.'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {resetSent && isResetMode ? (
                <div className="p-4 rounded-lg bg-brand-gold/10 border border-brand-gold/30 text-foreground text-sm flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-brand-gold-dark shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-brand-gold-dark">Solicitação enviada!</p>
                    <p className="text-muted-foreground mt-1">
                      Enviamos as instruções para <strong>{email}</strong>. Siga o link no e-mail
                      para cadastrar uma nova senha.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">E-mail corporativo</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@escritorio.com.br"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  {!isResetMode && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Senha</Label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsResetMode(true)
                            setErrorMsg('')
                            setResetSent(false)
                          }}
                          className="text-xs text-brand-gold-dark hover:underline font-semibold"
                        >
                          Esqueceu a senha?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? (
                  'Aguarde...'
                ) : isResetMode ? (
                  'Enviar link de recuperação'
                ) : (
                  <>
                    Acessar RT360
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              {isResetMode && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => {
                    setIsResetMode(false)
                    setErrorMsg('')
                    setResetSent(false)
                  }}
                >
                  Voltar para o login
                </Button>
              )}

              <div className="mt-2 text-center text-xs text-muted-foreground">
                Credencial padrão configurada: <br />
                <code className="text-brand-gold-dark font-mono font-medium">
                  psdesouzaconsultoria@gmail.com
                </code>{' '}
                / <code className="text-brand-gold-dark font-mono font-medium">Skip@Pass</code>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
