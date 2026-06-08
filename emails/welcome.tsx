import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  username?: string;
  frontendUrl?: string;
}

export const WelcomeEmail = ({
  username = 'entrenador',
  frontendUrl = 'http://localhost:3000',
}: WelcomeEmailProps) => {
  const previewText = `🎉 ¡Bienvenido a SeaTgc, ${username}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>🎉 ¡Bienvenido a SeaTgc!</Heading>
          </Section>
          <Section style={body}>
            <Text style={paragraph}>¡Hola <strong>{username}</strong>!</Text>
            <Text style={paragraph}>
              Gracias por registrarte en <strong>SeaTgc</strong>, tu tienda de confianza
              para cartas Pokémon TCG originales.
            </Text>
            <Text style={paragraph}>
              Acá podés explorar cientos de cartas, armar tu colección y recibirlas en
              la puerta de tu casa con toda la protección que merecen.
            </Text>
            <Section style={center}>
              <Button style={button} href={frontendUrl}>
                Explorar cartas
              </Button>
            </Section>
            <Text style={paragraph}>
              ¡Que tengas un excelente día y atrapa'los a todos!
            </Text>
            <Text style={paragraph}>— El equipo de SeaTgc</Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              SeaTgc — Fan store independiente de cartas Pokémon TCG
            </Text>
            <Text style={footerTextSmall}>
              Pokémon TCG data © Pokémon. SeaTgc no está afiliado a Pokémon.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

const main = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  backgroundColor: '#f4f4f4',
  margin: 0,
  padding: 0,
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
};

const header = {
  background: 'linear-gradient(135deg, #e53e3e, #c53030)',
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#fff',
  margin: 0,
  fontSize: '24px',
};

const body = {
  padding: '32px 24px',
};

const paragraph = {
  color: '#333',
  lineHeight: 1.6,
  fontSize: '16px',
};

const center = {
  textAlign: 'center' as const,
  marginTop: '24px',
};

const button = {
  backgroundColor: '#e53e3e',
  color: '#fff',
  textDecoration: 'none',
  padding: '12px 28px',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '16px',
};

const footer = {
  backgroundColor: '#f8f8f8',
  padding: '16px 24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#666',
  fontSize: '13px',
  margin: '4px 0',
};

const footerTextSmall = {
  color: '#999',
  fontSize: '11px',
  margin: '4px 0',
};
