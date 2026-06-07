# Agent Skills Hub

MVP local de uma plataforma SaaS para organizar Skills, Agentes, MCPs, Uploads, Projetos, Coleções e Templates.

## Como rodar

Abra `index.html` no navegador ou rode um servidor estático:

```powershell
python -m http.server 5173
```

Depois acesse `http://localhost:5173`.

## O que está implementado

- Dashboard com métricas e alertas.
- Biblioteca geral com busca, filtros e visualização em cards/tabela.
- CRUD funcional para Skills, Agentes, MCPs, Uploads, Projetos, Coleções e Templates.
- Relacionamento entre agentes, skills, MCPs e arquivos.
- Central de Uploads com detecção simples de classificação.
- Upload dentro do editor por meio da seção Arquivos Relacionados.
- Conversão de upload em Skill, Agente ou MCP.
- Catálogo local em `data/local-library.json`, gerado a partir de `E:\_HELIOJR\_CLAUDE`, com separação entre Skills, Agentes, MCPs e Uploads.
- Tela Importar com botão para carregar o catálogo local, filtrar e importar itens selecionados.
- Importação e exportação JSON.
- Versionamento básico ao editar itens.
- Soft delete, arquivamento e dados de exemplo.
- `schema.sql` com proposta PostgreSQL/Supabase multi-tenant e RLS.

## Persistência

O MVP usa `localStorage` para permitir teste imediato sem backend. A estrutura dos dados acompanha o schema multi-tenant por `organization_id`, preparada para migração para Supabase/PostgreSQL.

## Catálogo local

O arquivo `data/local-library.json` é um inventário organizado dos arquivos em `E:\_HELIOJR\_CLAUDE`. Ele não move nem apaga os arquivos originais. Para usar:

1. Rode `python -m http.server 5173`.
2. Acesse `http://localhost:5173`.
3. Abra **Importar**.
4. Clique em **Carregar catálogo**.
5. Filtre por `skill`, `agent`, `mcp` ou `upload`.
6. Selecione itens ou importe o filtro atual.

Por padrão, os itens importados entram como `rascunho`, mantendo o caminho original em `storage_path/source_path`.

## Próximos passos recomendados

- Ligar o frontend ao Supabase Auth, Database e Storage.
- Completar policies RLS para todas as tabelas.
- Trocar previews locais de upload por objetos em bucket privado.
- Adicionar testes de integração para importação/exportação e regras de vínculo.
