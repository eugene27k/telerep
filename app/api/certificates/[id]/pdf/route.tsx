import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { CertificateDoc } from '@/lib/certificate/template';
import { getCertificate } from '@/lib/db/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await getCertificate(id);
  if (!data) return new NextResponse('Certificate not found', { status: 404 });

  const url = new URL(req.url);
  const verifyUrl = `${url.origin}/verify/${data.cert.id}`;

  const buffer = await renderToBuffer(
    <CertificateDoc
      recipientName={data.user.display_name}
      communityTitle={data.chat.title}
      rank={data.cert.rank}
      issuedAt={data.cert.issued_at}
      certificateId={data.cert.id}
      verifyUrl={verifyUrl}
    />,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="telerep-certificate-${id.slice(0, 8)}.pdf"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
