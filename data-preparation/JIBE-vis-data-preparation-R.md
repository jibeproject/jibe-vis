# JIBE Melbourne Mode Choice Preparation and Analysis


# JIBE-Vis data preparation

The JIBE-Vis project (aka VicHealth-Viz) aims to make the [Joining
Impact models of transport with spatial measures of the Built
Environment (JIBE) project](https://jibeproject.com) modelling outputs
accessible and useful for stakeholders, both in Melbourne and
Manchester. More broadly, the proposed platform
(https://transporthealthimpacts.org) is intended to serve as an ongoing
outlet for data stories illustrating the health impacts of transport
planning scenarios.

This notebook will be used to record additional data processing
undertaken using JIBE modelling outputs and additional external data for
inclusion in the Transport Health Impacts data platform.

## Background

Through the JIBE project (Joining Impact models of transport with
spatial measures of the Built Environment) and the associated [AToM
project](https://doi.org/10.1080/15472450.2024.2372894) ( Activity-based
and agent-based Transport model of Melbourne), we have developed
agent-based transport simulation models (ABMs) capable of depicting
complex urban systems. These ABMs model how street-level built
environment exposures influence behaviour, accessibility and health with
high spatial and demographic granularity. By forecasting travel
itineraries, behaviours, exposures, and health for a synthetic
population of individuals, these ABMs allow us to simulate scenarios of
interest to health and transport planners. However, the complexity of
the models and their extensive, detailed outputs can be a barrier to
effective knowledge translation and therefore impact.

This web site provides illustrative examples of potential functionality
that we could implement in an interactive tool to make transport and
health modelling results from JIBE and similar projects accessible and
useful. Through our engagement with stakeholders, we will incorporate
and test new functionality that can help meet their needs and achieve
this goal. The website is being developed as open source software on
[GitHub](https://github.com/jibeproject/jibe-vis).

The approach to complex systems modelling undertaken in the JIBE project
is illustrated in the following diagram:
![image.png](attachment:image.png)

\### Aims We plan to engage government and advocacy stakeholders and
researchers to co-develop an interactive platform with two related aims:

1.  To make complex urban systems modelling evidence accessible and
    useful for informing healthy transport planning policy and localised
    infrastructure interventions; and
2.  Support visualising the impacts of modelled transportation
    scenarios.

We plan to publish the methods and visualisation platform developed
through this work as open source code that can be adapted by other
researchers and practitioners for new settings for translation of
research evidence into practice.

\## JIBE outputs

The JIBE outputs are stored in a shared sharepoint/Teams folder ([JIBE
working
group](https://rmiteduau.sharepoint.com/:f:/r/sites/JIBEworkinggroup/Shared%20Documents/General?csf=1&web=1&e=xxdKd0))
that contains the following sub-folders:

- documentation
  - a spreadsheet for documenting outputs and their documentation
- manchester
  - documentation and outputs relating to the Manchester modelling
    components:
    - accessibility
    - airPollutant
    - health
    - MATSim
    - network
    - noise
    - physicalActivity
    - skims
    - synPop
- melbourne
  - documentation and outputs relating to the Melbourne modelling
    components
    - 20min_interventions
    - addresses
    - cycling_intervention
    - dem
    - freight
    - gtfs
    - health
    - injuries
    - network
    - noise
    - osm
    - poi
    - regions
    - synthetic_population
- visualisation
  - documentation and outputs related to the JIBE visualisation research
    translation project component, including this notebook and a copy of
    the Transport Health Impacts website code (a NodeJS typescript
    website, authored using the React framework). Because of challenges
    with syncing and building/rebuilding NodeJS libraries, the actual
    development is occurring in an offline folder. This folder contains
    a copy of the code repository
    https://github.com/jibeproject/jibe-vis. The app itself is deployed
    upon successful code pushes to GitHub using AWS Amplify, at
    https://transporthealthimpacts.org.
  - This notebook is now being commenced as a refinement of seperate
    OneNote records, and will also record future planned data
    preparation drawing on data located in the above mentioned folders.

  ## Pre-requisites

  Code was authored using [R](https://cloud.r-project.org/) 4.4.1 and
  [Positron
  2024.10.0-14](https://github.com/posit-dev/positron/releases/tag/2024.10.0-14)
  IDE.

No data or data-related outputs will be included in this document or
repository. By default, output is set to False. For non-sensitive
aspects, e.g. displaying the sessionInfo() after running analysis, this
may be over-ridden.

## Status

14 October 2024: commenced, in progress

## System environment set up

Project dependencies are described in the [`renv.lock`](./renv.lock)
file; see [renv](https://rstudio.github.io/renv/) for more information.
Instructions on installing dependencies using an `renv` lock file are
[here](https://rstudio.github.io/renv/articles/renv.html#installing-packages).

With `renv` installed, dependencies were installed by running:

    renv::install(c('conflicted','fastDummies','janitor','knitr','tidyverse','sf','dplyr'))

``` r
rm(list = ls()) # clear memory
library(conflicted) # package conflict handling https://stackoverflow.com/a/75058976
library(janitor) # data cleaning
library(knitr) # presentation
library(tidyverse) # data handling
library(fastDummies) # binary dummy variable utility
library(sf) # for coordinate reference transformation
library(dplyr)

conflict_prefer("filter", "dplyr")
conflict_prefer("lag", "dplyr")
```

## Data sources

``` r
data <- list(Manchester = list(), Melbourne = list(), Munich = list())

data$Manchester[["Population"]] <- list(
  source = "",
  description = "",
  citation = "",
  variables = list(
    a = 'A variable',
    b = 'another variable'
  )
)
```

Test display of data structure

``` r
data
## $Manchester
## $Manchester$Population
## $Manchester$Population$source
## [1] ""
## 
## $Manchester$Population$description
## [1] ""
## 
## $Manchester$Population$citation
## [1] ""
## 
## $Manchester$Population$variables
## $Manchester$Population$variables$a
## [1] "A variable"
## 
## $Manchester$Population$variables$b
## [1] "another variable"
## 
## 
## 
## 
## $Melbourne
## list()
## 
## $Munich
## list()
```

Test no display of data structure

``` r
data
```
