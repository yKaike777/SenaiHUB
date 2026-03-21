# SENAIHub

> A rede social da sua turma.

SENAIHub é uma rede social desenvolvida para a comunidade SENAI, permitindo que alunos compartilhem publicações, interajam através de curtidas e comentários, troquem mensagens privadas em tempo real e acessem informações sobre cursos disponíveis na instituição.

---

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Banco de Dados](#banco-de-dados)
- [Funcionalidades](#funcionalidades)
- [Regras de Segurança](#regras-de-segurança)
- [Como Rodar](#como-rodar)
- [Deploy](#deploy)

---

## Sobre o Projeto

O projeto foi desenvolvido como trabalho final do curso **Técnico em Informática para Web** no SENAI. A plataforma foi construída com foco em usabilidade, responsividade e integração completa com serviços em nuvem, utilizando o Firebase como backend principal.

**Destaques:**

- Autenticação exclusiva com e-mail institucional `@aluno.senai.br`
- Feed de publicações com formatação rica (negrito, itálico, sublinhado, tachado)
- Mensagens privadas em tempo real via Firestore
- Sistema de cursos com matrícula e controle de administrador
- Upload de foto de perfil via Firebase Storage
- Design responsivo — funciona em desktop e mobile
- Perfis públicos com abas de seguidores e seguindo

---

## Tecnologias Utilizadas

| Tecnologia | Uso |
|---|---|
| React 18 | Biblioteca principal de interface |
| Vite | Bundler e servidor de desenvolvimento |
| React Router DOM v6 | Roteamento client-side com rotas protegidas |
| Firebase Authentication | Autenticação de usuários com e-mail e senha |
| Cloud Firestore | Banco de dados NoSQL em tempo real |
| Firebase Storage | Armazenamento de fotos de perfil |
| React Icons | Ícones (Font Awesome via `react-icons/fa`) |
| DM Sans + Syne | Tipografia via Google Fonts |
| CSS com variáveis | Design system próprio com variáveis CSS |

---

## Estrutura de Pastas

```
src/
├── assets/
│   └── default-avatar.jpg
├── components/
│   ├── Aside.jsx
│   ├── AsideFooter.jsx
│   ├── CreatePost.jsx
│   ├── Post.jsx
│   ├── ProtectedRoute.jsx
│   ├── SuggestedUsers.jsx
│   └── UserInfo.jsx
├── context/
│   └── AuthContext.jsx
├── firebase/
│   ├── firebase.js          # Inicialização e credenciais
│   ├── index.js             # Exportações centralizadas
│   ├── authService.js       # Login, cadastro, logout
│   ├── userService.js       # Perfis, follows, sugestões
│   ├── postService.js       # Posts, likes, comentários
│   ├── courseService.js     # Cursos, matrículas
│   ├── messageService.js    # Conversas e mensagens
│   └── storageService.js    # Upload de imagens
├── pages/
│   ├── AuthPage.jsx         # Login e cadastro
│   ├── Feed.jsx
│   ├── Profile.jsx          # Perfil do usuário logado
│   ├── UserProfile.jsx      # Perfil público de outros usuários
│   ├── Courses.jsx
│   ├── Messages.jsx
│   ├── Configuration.jsx
│   └── NotFoundPage.jsx
├── App.jsx
├── App.css
└── main.jsx
```

---

## Banco de Dados

O Firestore está organizado em 4 coleções principais.

### `users/{uid}`

Criado automaticamente no cadastro. O ID do documento é igual ao UID do Firebase Auth.

```
name            string
email           string
course          string
location        string
bio             string
profilePicture  string    URL do Firebase Storage
followers       string[]  Array de UIDs
following       string[]  Array de UIDs
postCount       number    Incrementado atomicamente
createdAt       timestamp
```

### `posts/{postId}`

Dados do autor são denormalizados para evitar joins no feed.

```
authorId        string
authorName      string
authorPicture   string
authorCourse    string
content         string    HTML com formatação rica
likes           map       { uid: true } — impede curtida dupla
likeCount       number    Mantido em sync para ordenação
commentCount    number
createdAt       timestamp
editedAt        timestamp   Preenchido apenas se o post foi editado
```

Subcoleção `posts/{postId}/comments/{commentId}`:

```
authorId        string
authorName      string
authorPicture   string
content         string
createdAt       timestamp
```

### `courses/{courseId}`

```
name            string
description     string
workLoad        number    Horas
thumbnail       string    URL da imagem de capa
studentCount    number    Mantido em sync
createdAt       timestamp
```

Subcoleção `courses/{courseId}/students/{uid}`:

```
enrolledAt      timestamp
```

### `conversations/{convId}`

O ID da conversa é gerado deterministicamente: `[uid1, uid2].sort().join('_')`. Isso garante que dois usuários sempre acessem a mesma conversa, sem duplicatas.

```
participants    string[]  [uid1, uid2]
lastMessage     string
lastSenderId    string
updatedAt       timestamp
```

Subcoleção `conversations/{convId}/messages/{msgId}`:

```
senderId        string
content         string
createdAt       timestamp
```

---

## Funcionalidades

### Autenticação

- Cadastro com nome, curso, cidade, e-mail e senha
- Validação de domínio: apenas `@aluno.senai.br` é aceito
- Login com e-mail e senha
- Sessão persistida automaticamente pelo Firebase Auth
- Logout com redirecionamento para `/login`
- Rotas protegidas: usuários não autenticados são redirecionados automaticamente

### Feed

- Posts em tempo real via `onSnapshot` — sem precisar recarregar a página
- Editor rico com negrito, itálico, sublinhado e tachado (`contentEditable` + `execCommand`)
- Botões de formatação com estado ativo visual
- Atalho `Ctrl+Enter` para publicar
- Curtir e descurtir com contagem em tempo real
- Seção de comentários com scroll automático
- Menu de três pontos (apenas para o autor do post):
  - **Editar** — editor inline com botões salvar/cancelar
  - **Excluir** — com dupla confirmação para evitar acidentes
- Posts editados exibem a marcação *editado*
- Painel lateral com sugestões de usuários reais do banco

### Perfil

- Exibição de nome, bio, localização e curso
- Edição inline de todos os campos
- Upload de foto de perfil (JPG, PNG ou WebP, máximo 3 MB)
  - Armazenada no Firebase Storage, URL salva no Firestore
  - Atualizada em todo o sistema imediatamente
- Contadores de posts, seguidores e seguindo (clicáveis)
- Abas **Seguidores** e **Seguindo** com lista de usuários
  - Cada usuário na lista é clicável (navega para o perfil)
  - Botão de seguir/deixar de seguir em cada item

### Perfis Públicos

- Rota `/user/:uid` — acessível clicando em qualquer foto ou nome
- Botão **Seguir** / **Seguindo** com parar de seguir
- Mesmas abas de seguidores e seguindo
- Redireciona para `/profile` se o UID for do próprio usuário
- Botão "Voltar" que usa o histórico de navegação

### Cursos

- Listagem de todos os cursos cadastrados
- Matrícula e desmatrícula com feedback visual imediato
- Contador de alunos atualizado na hora

**Área de administrador** (controlada por lista de e-mails em `Courses.jsx`):

- Criar cursos via modal (botão + atalho `Ctrl+Shift+N`)
- Excluir cursos com dupla confirmação
- A exclusão remove também a subcoleção de alunos

### Mensagens

- Contatos: usuários que você segue
- Mensagens em tempo real via `onSnapshot`
- ID de conversa determinístico — sem duplicatas
- Scroll automático para a última mensagem
- Preview da última mensagem na lista de contatos
- Envio com `Enter` ou clique no botão

### Navegação

- Sidebar com ícones e links para todas as seções
- Popup no rodapé da sidebar ao clicar no avatar: perfil, configurações, logout
- Menu hamburguer em mobile com overlay e animação de deslize
- Layout responsivo para telas a partir de 400px

---

## Regras de Segurança

As regras do Firestore garantem que cada usuário só modifique seus próprios dados.

```js
// users — atualização pelo próprio usuário OU apenas campos followers/following
// posts — criação exige authorId === uid do solicitante
//       — atualização pelo autor OU apenas likes/likeCount
// conversations — leitura/escrita apenas para participantes
// courses — leitura livre, escrita para qualquer autenticado (admin controlado no frontend)
```

Regras do Firebase Storage:

```
profile-pictures/{uid}/avatar — escrita apenas pelo próprio usuário
```

---

## Como Rodar

### Pré-requisitos

- Node.js 18 ou superior
- Conta no [Firebase Console](https://console.firebase.google.com)
- Projeto Firebase com **Authentication**, **Firestore** e **Storage** ativados

### Instalação

```bash
# 1. Instale as dependências
npm install

# 2. Configure as credenciais Firebase
# Edite src/firebase/firebase.js e substitua os valores de firebaseConfig

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` no navegador.

### Configuração do Firebase

1. **Authentication** → ative o provedor *Email/Password*
2. **Firestore** → crie o banco e aplique as regras de segurança
3. **Storage** → ative e configure as regras de permissão por UID

### Configuração de Administrador

Adicione o e-mail desejado à lista em `src/pages/Courses.jsx`:

```js
const ADMIN_EMAILS = [
  'seu.email@aluno.senai.br',
]
```

### Acessar pelo Celular (rede local)

```bash
# Windows: descubra seu IP
ipconfig

# Acesse no celular (mesma rede Wi-Fi)
http://[SEU_IP]:5173
```

---

## Deploy

Para publicar gratuitamente na [Vercel](https://vercel.com):

1. Suba o projeto para um repositório GitHub
2. Acesse vercel.com e faça login com GitHub
3. Importe o repositório — a Vercel detecta o Vite automaticamente
4. Clique em **Deploy**

Você receberá uma URL pública como `seuapp.vercel.app`.

> Considere mover as credenciais do Firebase para variáveis de ambiente (`.env`) antes do deploy em produção.

---

## Informações do Projeto

| | |
|---|---|
| **Desenvolvedor** | Kaike Gabriel Tavares Barros |
| **Instituição** | SENAI |
| **Curso** | Técnico em Informática para Web |
| **Ano** | 2026 |
| **Stack** | React + Firebase |
