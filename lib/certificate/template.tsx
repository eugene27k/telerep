import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    color: '#0a0a0a',
  },
  border: {
    flex: 1,
    border: '1pt solid #0a0a0a',
    paddingHorizontal: 60,
    paddingVertical: 50,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 11,
    letterSpacing: 6,
    color: '#666666',
  },
  title: {
    fontSize: 30,
    fontFamily: 'Helvetica-Bold',
    marginTop: 14,
  },
  caption: {
    fontSize: 12,
    color: '#666666',
    marginTop: 36,
    textAlign: 'center',
  },
  name: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    marginTop: 12,
    textAlign: 'center',
  },
  rankCaption: {
    fontSize: 12,
    color: '#666666',
    marginTop: 26,
    textAlign: 'center',
  },
  rank: {
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    marginTop: 6,
  },
  community: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  date: {
    fontSize: 11,
    color: '#666666',
    marginTop: 36,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
  },
});

export type CertificateProps = {
  recipientName: string;
  communityTitle: string;
  rank: number;
  issuedAt: string;
  certificateId: string;
  verifyUrl: string;
};

export function CertificateDoc({
  recipientName,
  communityTitle,
  rank,
  issuedAt,
  certificateId,
  verifyUrl,
}: CertificateProps) {
  const date = new Date(issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return (
    <Document
      title={`TeleRep Certificate — ${recipientName}`}
      author="TeleRep"
      subject={`Rank #${rank} in ${communityTitle}`}
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <Text style={styles.brand}>TELEREP</Text>
          <Text style={styles.title}>Certificate of Recognition</Text>
          <Text style={styles.caption}>This certifies that</Text>
          <Text style={styles.name}>{recipientName}</Text>
          <Text style={styles.rankCaption}>achieved rank</Text>
          <Text style={styles.rank}>#{rank}</Text>
          <Text style={styles.community}>in {communityTitle}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <Text style={styles.footer}>
          Certificate ID: {certificateId} {'•'} Verify at {verifyUrl}
        </Text>
      </Page>
    </Document>
  );
}
