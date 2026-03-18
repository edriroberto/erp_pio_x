export default function DashboardCard({ titulo, valor, cor }) {

  return (

    <div style={{
      background:"#fff",
      borderRadius:10,
      padding:"6px 10px",
      boxShadow:"0 1px 3px rgba(0,0,0,0.08)",
      borderTop:`1px solid ${cor || "#4a90e2"}`
    }}>

      <div style={{
        fontSize:12,
        color:"#777",
        marginBottom:-5,
        marginTop: -5,
        lineHeight: 1.1
      }}>
        {titulo}
      </div>

      <div style={{
        textAlign: "center",
        fontSize:14,
        fontWeight:600
      }}>
        {valor}
      </div>

    </div>

  )

}