import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface PurchaseConfirmationProps {
  username?: string;
  orderId?: number;
  total?: string;
  items?: { name: string; qty: number; price: string }[];
  frontendUrl?: string;
}

export const PurchaseConfirmation = ({
  username = 'entrenador',
  orderId = 123,
  total = 'S/ 0.00',
  items = [],
  frontendUrl = 'http://localhost:3000',
}: PurchaseConfirmationProps) => {
  const previewText = `✅ Compra confirmada — SeaTgc #${orderId}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>✅ ¡Compra confirmada!</Heading>
          </Section>
          <Section style={body}>
            <Text style={paragraph}>¡Hola <strong>{username}</strong>!</Text>
            <Text style={paragraph}>
              Tu pedido en <strong>SeaTgc</strong> se ha procesado correctamente.
              Acá están los detalles:
            </Text>

            <Section style={summaryBox}>
              <Text style={orderLabel}>Orden #{orderId}</Text>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Producto</th>
                    <th style={th}>Cant.</th>
                    <th style={{ ...th, textAlign: 'right' }}>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td style={td}>{item.name}</td>
                      <td style={td}>{item.qty}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Text style={totalText}>Total: {total}</Text>
            </Section>

            <Text style={paragraph}>
              Recibirás tu pedido con toploader y sleeves premium para mantener tus
              cartas en perfecto estado.
            </Text>

            <Section style={center}>
              <Button style={button} href={frontendUrl}>
                Seguir comprando
              </Button>
            </Section>

            <Text style={paragraph}>¡Gracias por tu compra!</Text>
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

export default PurchaseConfirmation;

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
  background: 'linear-gradient(135deg, #48bb78, #38a169)',
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
  backgroundColor: '#48bb78',
  color: '#fff',
  textDecoration: 'none',
  padding: '12px 28px',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '16px',
};

const summaryBox = {
  backgroundColor: '#f7fafc',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const orderLabel = {
  fontWeight: 'bold',
  marginTop: 0,
  fontSize: '16px',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const th = {
  textAlign: 'left' as const,
  padding: '8px',
  borderBottom: '2px solid #e2e8f0',
  color: '#666',
  fontSize: '14px',
};

const td = {
  padding: '8px',
  borderBottom: '1px solid #e2e8f0',
  fontSize: '14px',
};

const totalText = {
  textAlign: 'right' as const,
  fontSize: '18px',
  fontWeight: 'bold',
  padding: '12px 8px 0',
  color: '#2d3748',
  margin: 0,
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
