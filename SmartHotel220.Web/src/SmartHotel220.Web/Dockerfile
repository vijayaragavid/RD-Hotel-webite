FROM microsoft/aspnetcore:2.0 AS base
WORKDIR /app
EXPOSE 80

FROM base as withnode
RUN apt-get update && apt-get install -my wget gnupg
RUN apt-get -qq update && apt-get -qqy --no-install-recommends install \
    git \
    unzip

RUN curl -sL https://deb.nodesource.com/setup_6.x |  bash -
RUN apt-get install -y nodejs

FROM microsoft/aspnetcore-build:2.0 AS build
WORKDIR /src
COPY SmartHotel220.Web/SmartHotel220.Web.csproj SmartHotel220.Web/
RUN dotnet restore SmartHotel220.Web/SmartHotel220.Web.csproj
COPY . .
RUN dotnet build SmartHotel220.Web/SmartHotel220.Web.csproj -c Release -o /webapp

FROM build AS publish
WORKDIR /src/SmartHotel220.Web
RUN npm rebuild node-sass
RUN dotnet publish SmartHotel220.Web.csproj -c Release -o /webapp

FROM withnode AS final
WORKDIR /app
COPY --from=publish /webapp .
ENTRYPOINT ["dotnet", "SmartHotel220.Web.dll"]
