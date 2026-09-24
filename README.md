# Portefólio de Arquitetura de Computadores

Portefólio digital de **Dinis Gaspar**, aluno da Escola José Falcão. O projeto reúne os sumários, os conteúdos estudados e as reflexões pessoais das aulas de Arquitetura de Computadores.

## Aceder ao projeto

- [Site público / professor](https://dinisgaspar.github.io/Arquitetura-de-computadores/index.html)
- [Painel de administração](https://dinisgaspar.github.io/Arquitetura-de-computadores/admin.html)

O site público permite consultar e pesquisar as aulas. O painel de administração é utilizado para criar, editar e apagar registos.

## Funcionalidades

- Registo de número, data, sumário e comentário de cada aula.
- Pesquisa de aulas por texto.
- Ordenação automática por número da aula.
- Persistência dos dados através do Supabase.
- Interface responsiva para computador e telemóvel.
- Página pública sem controlos de edição.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Supabase
- GitHub Pages

## Estrutura do projeto

```text
.
├── index.html       # Página pública
├── admin.html       # Painel de administração
├── script.js        # Lógica das aulas e ligação ao Supabase
├── styles.css       # Estilos do projeto
├── config.js        # Configuração pública do Supabase
└── technology-bg.jpg # Imagem tecnológica do cabeçalho
```

## Configuração do Supabase

A tabela utilizada pelo projeto chama-se `lessons` e deve conter estas colunas:

| Coluna | Tipo |
| --- | --- |
| `id` | `uuid` |
| `number` | `text` |
| `date` | `text` |
| `summary` | `text` |
| `comment` | `text` |
| `created_at` | `timestamptz` |

As políticas da tabela devem permitir que o site leia e insira aulas através da chave pública configurada em `config.js`.

## Publicar alterações

O site é publicado a partir da branch `gh-pages`:

```bash
git add .
git commit -m "Descrever alteração"
git push origin gh-pages
```

Depois do `push`, o GitHub Pages pode demorar alguns minutos a atualizar.

## Objetivos da disciplina

- Compreender os principais componentes de um computador.
- Conhecer a organização e o funcionamento de um sistema computacional.
- Relacionar conceitos teóricos com exemplos práticos.
- Registar a evolução e as aprendizagens feitas ao longo das aulas.

## Autor

**Dinis Gaspar**

Aluno da Escola José Falcão
