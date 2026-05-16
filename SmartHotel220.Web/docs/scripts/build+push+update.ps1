cd D:\GraduationProject\SmartHotel220.Web\src
docker-compose build

$tag = "v2"

docker tag smarthotel220/web:latest smarthotel220/web:$tag
docker push smarthotel220/web:$tag
kubectl set image deployment/web web=smarthotel220/web:$tag
kubectl get pod

pause