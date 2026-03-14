export default function Tabela({colunas, dados}){

  return(

    <div className="tabela-container">

      <table className="tabela">

        <thead>
          <tr>
            {colunas.map(c=>(
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>

        <tbody>

          {dados.map((linha,i)=>(
            <tr key={i}>
              {linha.map((col,j)=>(
                <td key={j}>{col}</td>
              ))}
            </tr>
          ))}

        </tbody>

      </table>

    </div>

  )
}
