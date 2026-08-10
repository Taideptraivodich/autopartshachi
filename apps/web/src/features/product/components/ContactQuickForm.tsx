import React, { useState } from 'react';
import { Input, Textarea } from '../../../components/ui';

interface Props {
  productName: string;
  productSku: string;
  onSuccess: () => void;
}

type FormState = 'idle' | 'submitting' | 'success' | 'error';

const API_BASE = 'http://localhost:3001/api';

const ContactQuickForm: React.FC<Props> = ({ productName, productSku, onSuccess }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(
    `Tôi muốn hỏi về sản phẩm: ${productName} (SKU: ${productSku})`,
  );
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (state === 'submitting') return;
    setState('submitting');
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/lien-he`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          message: message.trim(),
          productName,
          productSku,
          source: 'product_page',
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }

      setState('success');
      // Đóng modal sau 1.5s khi thành công
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi gửi liên hệ');
    }
  };

  if (state === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
        <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>✅</div>
        <p style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>
          Đã gửi thành công!
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
          Chúng tôi sẽ liên hệ sớm.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <Input
        label="Họ tên"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nguyễn Văn A"
        disabled={state === 'submitting'}
      />
      <Input
        label="Số điện thoại"
        type="tel"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="0912 345 678"
        disabled={state === 'submitting'}
      />
      <Textarea
        label="Nội dung"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        disabled={state === 'submitting'}
      />

      {state === 'error' && (
        <p style={{ color: '#b91c1c', fontSize: 'var(--text-sm)', margin: 0 }}>
          ⚠ {errorMsg}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={state === 'submitting' || !name.trim() || !phone.trim()}
        style={{
          padding: 'var(--space-3) var(--space-5)',
          background: 'var(--color-primary)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontWeight: 'var(--font-semibold)',
          fontSize: 'var(--text-sm)',
          cursor: state === 'submitting' ? 'not-allowed' : 'pointer',
          opacity: state === 'submitting' ? 0.7 : 1,
        }}
      >
        {state === 'submitting' ? 'Đang gửi...' : 'Gửi yêu cầu'}
      </button>
    </div>
  );
};

export default ContactQuickForm;
