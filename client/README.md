# Nghia Van EC

## Usage

This project was bootstrapped with [Vite](https://vitejs.dev/).

### Project setup

```
npm install
```

#### Compiles and hot-reloads for development

```
npm run dev
```

#### Compiles and minifies for production

```
npm run build
```

### Deploy using Docker

#### Compile

```
npm run build
```

#### Build image

```
docker build -t <image_name>:<tag> .
```

#### Start the container

```
docker run --rm -d --network <network> --name <container_name> -p 80:80 <image_name>:<tag>
```