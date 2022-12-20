FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 5035

ENV ASPNETCORE_URLS=http://+:5035

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["thumbnailAPI/thumbnailAPI.csproj", "thumbnailAPI/"]
RUN dotnet restore "thumbnailAPI\thumbnailAPI.csproj"
COPY . .
WORKDIR "/src/thumbnailAPI"
RUN dotnet build "thumbnailAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "thumbnailAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "thumbnailAPI.dll"]
