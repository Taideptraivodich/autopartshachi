import React from "react";
import { useAdminAuth } from "../../../features/admin/context/AdminAuthContext";
import { Button } from "../../../components/ui";

/**
 * AdminDashboardPage — minimal MVP placeholder.
 * Handover #2 will replace the body with product management UI.
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
        <p style={{ color: "#666" }}>
          Chào mừng. Tính năng quản lý sản phẩm sẽ được bổ sung ở Handover #2.
        </p>
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
};

export default AdminDashboardPage;
