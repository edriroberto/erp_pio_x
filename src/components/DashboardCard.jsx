export default function DashboardCard({ titulo, valor }) {

  return (

    <div style={{
      flex:1,
      background:'#fff',
      borderRadius:14,
      padding:14,
      boxShadow:'0 1px 3px rgba(0,0,0,0.08)'
    }}>

      <div style={{
        fontSize:12,
        color:'#777',
        marginBottom:4
      }}>
        {titulo}
      </div>

      <div style={{
        fontSize:24,
        fontWeight:'600'
      }}>
        {valor}
      </div>

    </div>

  )

}