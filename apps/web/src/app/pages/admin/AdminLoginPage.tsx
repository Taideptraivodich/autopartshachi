import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../../features/admin/context/AdminAuthContext";
import { Input, Button } from "../../../components/ui";

const AdminLoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Already logged in — go straight to dashboard
  React.useEffect(() => {
    if (isAuthenticated) navigate("/admin", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Đăng nhập Admin</h1>
        <p style={styles.subtitle}>Hachi Auto Parts — Quản trị viên</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={loading}
          />
          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={loading}
          />

          {error && <p style={styles.error}>{error}</p>}

          <Button type="submit" fullWidth loading={loading}>
            Đăng nhập
          </Button>
        </form>
      </div>
    </div>
  );
};

// Minimal inline styles — no external CSS dependency.
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f5f5",
  },
  card: {
    background: "#fff",
    borderRadius: 8,
    padding: "2.5rem 2rem",
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#111",
  },
  subtitle: {
    marginTop: 4,
    marginBottom: "1.5rem",
    color: "#666",
    fontSize: "0.9rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  error: {
    color: "#d32f2f",
    fontSize: "0.875rem",
    margin: 0,
  },
};

export default AdminLoginPage;
