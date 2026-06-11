import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'

interface ResetPasswordProps {
  username?: string
  resetUrl?: string
}

export const ResetPassword = ({ username = 'entrenador', resetUrl = 'http://localhost:3000/reset-password/token' }: ResetPasswordProps) => (
  <Html>
    <Head />
    <Preview>🔑 Recuperación de contraseña — SeaTgc</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={title}>🔑 Recuperación de contraseña</Heading>
        </Section>
        <Section style={body}>
          <Text style={p}>¡Hola <strong>{username}</strong>!</Text>
          <Text style={p}>Recibimos una solicitud para restablecer tu contraseña en <strong>SeaTgc</strong>.</Text>
          <Text style={p}>Hacé clic en el botón para crear una nueva contraseña:</Text>
          <Section style={center}>
            <Button style={btn} href={resetUrl}>Restablecer contraseña</Button>
          </Section>
          <Text style={p}>Este enlace expira en <strong>1 hora</strong>.</Text>
          <Text style={p}>Si no solicitaste esto, ignorá este mensaje.</Text>
          <Text style={p}>— El equipo de SeaTgc</Text>
        </Section>
        <Section style={footer}>
          <Text style={fText}>SeaTgc — Fan store independiente de cartas Pokémon TCG</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ResetPassword

const main = { fontFamily: "'Segoe UI', Arial, sans-serif", backgroundColor: '#f4f4f4', margin: 0, padding: 0 }
const container = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden' }
const header = { background: 'linear-gradient(135deg, #e53e3e, #c53030)', padding: '32px 24px', textAlign: 'center' as const }
const title = { color: '#fff', margin: 0, fontSize: '24px' }
const body = { padding: '32px 24px' }
const p = { color: '#333', lineHeight: 1.6, fontSize: '16px' }
const center = { textAlign: 'center' as const, marginTop: '24px' }
const btn = { display: 'inline-block', backgroundColor: '#e53e3e', color: '#fff', textDecoration: 'none', padding: '12px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }
const footer = { backgroundColor: '#f8f8f8', padding: '16px 24px', textAlign: 'center' as const }
const fText = { color: '#666', fontSize: '13px', margin: '4px 0' }
