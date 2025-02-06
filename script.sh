cd app/connector/mynodejs && \
ddn connector setenv --connector connector.yaml -- npm run start && \
cd ../../../ && \
HASURA_DDN_PAT=$(ddn auth print-pat) PROMPTQL_SECRET_KEY=$(ddn auth print-promptql-secret-key) docker compose -f compose.yaml --env-file .env up --build --pull always
