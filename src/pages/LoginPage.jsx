import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "#f5f6fa",
      padding: "20px"
    }}>
      <LoginForm />
    </div>
  )
}