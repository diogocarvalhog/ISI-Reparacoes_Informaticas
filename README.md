# 💻 ISI – Reparações Informáticas

Aplicação desenvolvida no âmbito da unidade curricular **Integração de Sistemas de Informação (ISI)**.  
O projeto tem como objetivo demonstrar a integração de dados através de um processo **ETL** e a sua visualização num **dashboard web interativo**.

---

## 🚀 Descrição

O sistema gere e analisa dados de **reparações informáticas**, permitindo normalizar informação proveniente de ficheiros CSV, enriquecê-la com dados externos (via API) e apresentá-la de forma dinâmica numa interface web.

---

## ⚙️ Funcionalidades

- Importação e limpeza de dados através do **KNIME Analytics Platform**  
- Enriquecimento de informação com **Google Custom Search API**  
- Exportação dos resultados em **CSV, JSON e XML**  
- Dashboard web com:
  - Indicadores e estatísticas gerais  
  - Filtros e pesquisa por cliente, marca ou estado  
  - Detalhes interativos de cada reparação  

---

## 🧩 Tecnologias

| Tipo | Ferramentas / Linguagens |
|------|---------------------------|
| ETL | KNIME Analytics Platform |
| API | Google Custom Search API |
| Frontend | HTML, CSS, JavaScript |
| CSV Parsing | PapaParse |
| Output | CSV, JSON, XML |

---

## 📂 Estrutura

ISI-Reparacoes_Informaticas/
├── KNIME_Workflow/         # Workflow ETL no KNIME
│   ├── workflow.knwf
│   └── outputs/
│       ├── output.csv
│       ├── output.json
│       └── output.xml
├── web_dashboard/           # Dashboard web
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md

---

## ▶️ Como Usar

1. **Executar o workflow KNIME** para gerar o ficheiro `output.csv`.  
2. **Abrir o ficheiro `index.html`** no navegador.  
3. **Importar o CSV** através da interface e explorar o dashboard.

> O dashboard é totalmente local — não necessita de servidor.

---

## 📈 Possíveis Melhorias

- Integração com base de dados SQL  
- Criação de gráficos dinâmicos (Chart.js / Recharts)  
- Ligação a uma API REST própria
- Envio automático de notificações (e-mail / SMS)

---

## 👤 Autor

**Diogo Graça**  
Licenciatura em Engenharia de Sistemas Informáticos — IPCA  
📅 2025/2026

🎥 Demonstração: [https://youtu.be/_xdVK6bqDsI](https://youtu.be/_xdVK6bqDsI)

---
