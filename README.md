NetID
=========

Toto je miniprojekt pro můj školní [lab](https://github.com/spseol/udelatka).

[backend](https://github.com/spseol/NetID/tree/main/backend) slouží pro převod jména (nick) sítě na ID (číslo) sítě.

[frontend](https://github.com/spseol/NetID/tree/main/frontend) slouží jako kukátko na jednotlivá jména, jejich ID
a jejich stáří. Mě to posloužilo jako projekt na kterém se učím
[Nuxt](https://nuxt.com/).


BackEnd
-----------

```
cd backend
flask run
```

```
GET http://localhost:54321/get/nazdar 
GET http://localhost:54321/get/ahoj 
GET http://localhost:54321/get/Nick 
GET http://localhost:54321/get/'Superkalifragilistikexpidaliozní název' 
```


FrontEnd
-------------

```
cd frontend
yarn install
yarn dev
```
