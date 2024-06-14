build
```bash
docker build . -t ctnelson1997/cs571-su24-hw9-api
docker push ctnelson1997/cs571-su24-hw9-api
```

run
```bash
docker pull ctnelson1997/cs571-su24-hw9-api
docker run --name=cs571_su24_hw9_api -d --restart=always -p 38109:38109 -v /cs571/su24/hw9:/cs571 ctnelson1997/cs571-su24-hw9-api
```

