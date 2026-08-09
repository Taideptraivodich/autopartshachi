import React from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../../features/admin/context/AdminAuthContext";
import { Button } from "../../../components/ui";

/**
 * AdminDashboardPage — MVP dashboard with links to admin modules.
 */
const AdminDashboardPage: React.FC = () => {
  const { logout } = useAdminAuth();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.logo}>Hachi Admin</span>
        <Button variant="ghost" size="sm" onClick={logout}>
          Đăng xuất
        </Button>
      </header>

      <main style={styles.main}>
        <h2>Bảng điều khiển</h2>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>Chào mừng.</p>

        <div style={styles.cardGrid}>
          <Link to="/admin/san-pham" style={styles.card}>
            <h3 style={styles.cardTitle}>Quản lý Sản phẩm</h3>
            <p style={styles.cardDesc}>
              Xem, thêm, sửa, xóa sản phẩm — danh mục, ảnh, mã OEM, xe tương thích.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.75rem 1.5rem",
    borderBottom: "1px solid #e5e7eb",
    background: "#fff",
  },
  logo: { fontWeight: 700, fontSize: "1rem", color: "#111" },
  main: { padding: "2rem 1.5rem", flex: 1 },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "1rem",
    maxWidth: 900,
  },
  card: {
    display: "block",
    padding: "1.25rem",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    background: "#fff",
    textDecoration: "none",
    color: "inherit",
  },
  cardTitle: { margin: "0 0 0.5rem", fontSize: "1rem", color: "#111" },
  cardDesc: { margin: 0, fontSize: "0.85rem", color: "#666" },
};

export default AdminDashboardPage;
