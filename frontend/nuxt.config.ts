// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    vue: {
        compilerOptions: {
            whitespace: "preserve"
        }
    },
  
    app: {
        head: {
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
            title: 'NetID',
            htmlAttrs: {
                lang: 'en'
            }
        }
    }
})
