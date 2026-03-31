export function formatarNome(nome, email) {
  if (nome) {
    return nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
  }

  if (email) {
    const base = email.split("@")[0];
    return base.charAt(0).toUpperCase() + base.slice(1);
  }

  return "Usuário";
}

export function getIniciais(nome, email) {
  if (nome) {
    return nome
      .split(" ")
      .map(p => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  if (email) {
    return email.substring(0, 2).toUpperCase();
  }

  return "U";
}