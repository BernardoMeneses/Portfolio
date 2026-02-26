FROM node:18-alpine as builder

WORKDIR /app

# Copiar package.json
COPY package.json ./

# Instalar dependências (incluindo devDependencies para o build)
RUN npm install

# Copiar código
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM nginx:alpine

# Copiar build
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração do nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
