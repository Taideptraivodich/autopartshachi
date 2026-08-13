import React, { useState } from "react";
import MetaTags from "../../components/ui/MetaTags";
import Breadcrumb from "../../components/ui/Breadcrumb";
import { Input, Textarea } from "../../components/ui";

type FormState = "idle" | "submitting" | "success" | "error";

const API_BASE = "http://localhost:3001/api";

const LienHePage: React.FC = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const reset = () => {
    setName("");
    setPhone("");
    setVehicle("");
    setMessage("");
    setState("idle");
    setErrorMsg("");
  };

  const handleSubmit = async () => {
    if (state === "submitting") return;
    setState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE}/lien-he`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          message: [
            vehicle.trim() ? `Xe đang dùng: ${vehicle.trim()}` : "",
            message.trim(),
          ]
            .filter(Boolean)
            .join("\n"),
          source: "website",
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ?? `HTTP ${res.status}`,
        );
      }

      setState("success");
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Lỗi gửi liên hệ");
    }
  };

  if (state === "success") {
    return (
      <>
        <MetaTags
          title="Liên hệ"
          description="Liên hệ với Hachi để được tư vấn phụ tùng ô tô chính hãng."
        />
        <div className="container">
          <div style={{ padding: "var(--space-6) 0" }}>
            <Breadcrumb
              items={[{ label: "Trang chủ", href: "/" }, { label: "Liên hệ" }]}
            />
          </div>
          <div
            style={{
              maxWidth: 480,
              margin: "0 auto",
              textAlign: "center",
              padding: "var(--space-12) var(--space-4)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "var(--space-4)" }}>
              ✅
            </div>
            <h2
              style={{
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-3)",
              }}
            >
              Cảm ơn bạn đã liên hệ!
            </h2>
            <p
              style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}
            >
              Chúng tôi sẽ gọi lại trong vòng 24 giờ làm việc.
            </p>
            <button
              onClick={reset}
              style={{
                marginTop: "var(--space-6)",
                padding: "var(--space-3) var(--space-5)",
                background: "var(--color-primary)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontWeight: "var(--font-semibold)",
                fontSize: "var(--text-sm)",
                cursor: "pointer",
              }}
            >
              Gửi yêu cầu khác
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MetaTags
        title="Liên hệ"
        description="Liên hệ với Hachi để được tư vấn phụ tùng ô tô chính hãng. Giao hàng toàn quốc."
      />
      <div className="container">
        <div style={{ padding: "var(--space-6) 0" }}>
          <Breadcrumb
            items={[{ label: "Trang chủ", href: "/" }, { label: "Liên hệ" }]}
          />
        </div>

        <div
          style={{
            maxWidth: 560,
            margin: "0 auto",
            paddingBottom: "var(--space-12)",
          }}
        >
          <h1
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: "var(--font-bold)",
              color: "var(--color-text-primary)",
              marginBottom: "var(--space-2)",
            }}
          >
            Liên hệ với chúng tôi
          </h1>
          <p
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "var(--space-6)",
              lineHeight: 1.6,
            }}
          >
            Để lại thông tin — đội ngũ Hachi sẽ gọi lại tư vấn và báo giá trong
            vòng 24 giờ làm việc.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            <Input
              label="Họ tên"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              disabled={state === "submitting"}
            />
            <Input
              label="Số điện thoại"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912 345 678"
              disabled={state === "submitting"}
            />
            <Input
              label="Xe đang dùng (không bắt buộc)"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="Toyota Vios 2020"
              disabled={state === "submitting"}
            />
            <Textarea
              label="Nội dung"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Tôi cần hỏi về phụ tùng..."
              disabled={state === "submitting"}
            />

            {state === "error" && (
              <p
                style={{
                  color: "#b91c1c",
                  fontSize: "var(--text-sm)",
                  margin: 0,
                }}
              >
                ⚠ {errorMsg}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={
                state === "submitting" ||
                !name.trim() ||
                !phone.trim() ||
                !message.trim()
              }
              style={{
                padding: "var(--space-3) var(--space-5)",
                background: "var(--color-primary-700)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontWeight: "var(--font-semibold)",
                fontSize: "var(--text-sm)",
                cursor: state === "submitting" ? "not-allowed" : "pointer",
                opacity:
                  state === "submitting" ||
                  !name.trim() ||
                  !phone.trim() ||
                  !message.trim()
                    ? 0.6
                    : 1,
                transition: "opacity 0.15s",
              }}
            >
              {state === "submitting" ? "Đang gửi..." : "Gửi yêu cầu tư vấn"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LienHePage;
