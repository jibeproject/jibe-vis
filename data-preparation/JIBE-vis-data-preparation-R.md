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

This [Quarto](https://quarto.org/) markdown document will be used to
record additional data processing undertaken using JIBE modelling
outputs and additional external data for inclusion in the [Transport
Health Impacts](https://transporthealthimpacts.org) data platform.

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

Initialising `data` object which will contain descriptions of the data
used for modelling and representing aspects each of Manchester and
Melbourne.

``` r
data <- list(Manchester = list(), Melbourne = list(), Munich = list())
```

Setting up area geometries for summarising outputs

``` r
data$Manchester[["areas"]] <- list()

# Output areas (id = 'JIBE OA linkage code' --- but only for linkage, doesn't need to be retained following this, so not listed below)
data$Manchester$areas[["OA"]] = list(
  source="manchester/synPop/sp_2021/OA_2021_MCR.shp",
  description = "Output Areas (2021)",
  variable = list(
    OA21CD = 'Output Area 2021 code',
    LSOA21CD = 'LSOA 2011 code',
    LSOA21NM = 'LSOA 2011 name'
  )
)

data$Manchester$areas[["LSOA"]] = list(
  source="manchester/synPop/sp_2019/LSOA_studyArea.shp",
  description = "Lower layer Super Output Areas (2011)",
  variable = list(
    LSOA11CD = 'LSOA 2011 code',
    LSOA11NM = 'LSOA 2011 name',
    LONG_ = 'Longitude',
    LAT = 'latitude'
  )
)
```

Setting up the network (pending data)

``` r
data$Manchester[["network"]] <- list(
  source=""
)
```

## Synthetic population

``` r
data$Manchester[["population"]] <- list()
```

### Persons

``` r
data$Manchester$population[["persons"]] <- list(
  source = "manchester/synpop/sp_2021/pp_health_2021.csv",
  description = "A generated representation of Greater Manchester's population characteristics, risks and outcomes (synthetic population).",
  citation = "?",
  variables = list(
    id = "person id",
    hhid = "household id",
    age = "in years",
    gender = "male (1), female (2)",
    relationship = "role within the household",
    occupation = "toddler (0), student (3), employed (1), unemployed (2), retiree (4)",
    driversLicense = "true or false",
    workplace = "job id (0 if person is not employed)",
    income = "in £",
    disability = "Disability status (?)",
    schoolId = "N/A (unless we present flow models)",
    totalTravelTime_sec = "Travel time to…",
    totalActivityTime_min = "Moderate/vigorous physical activity (?; mins)",
    totalTimeAtHome_min = "Time spend at home (mins)",
    lightInjuryRisk = "?",
    severeInjuryRisk = "?",
    fatalityRisk = "?",
    mmetHr_walk = "marginal metabolic equivalent task hours per week (mMET-h/wk) 1 ",
    mmetHr_cycle = "mMET (h/wk)",
    exposure_pm25 = "Exclude ?",
    exposure_no2 = "Exclude ?",
    exposure_normalised_pm25 = "PM2.5 exposure (µg/m3?) 2",
    exposure_normalised_no2 = "NO2 exposure (µg/m3?) 3",
    rr_walk = "Relative risk of injury when taking a walking trip?",
    rr_cycle = "Relative risk of injury when taking a cycling trip?",
    rr_pm25 = "Relative risk of injury per cubic metre exposure to …",
    rr_no2 = "Relative risk of injury per cubic metre exposure to …",
    rr_all = "?"
  )
)
```

### Households

Dwelling ID (dwelling) and Household ID (id; omitted) appear identical
(assert id==dwelling)

``` r
data$Manchester$population[["households"]] <- list(
  source = "manchester/synpop/sp_2021/hh_2021.csv",
  description = "A generated representation of Greater Manchester household characteristics, risks and outcomes (synthetic population).",
  citation = "?",
  variables = list(
    id = "Household id",
    zone = "Output Area",
    hhSize = "Number of persons in household",
    autos = "Number of cars in household (0, 1, 2, >3)"
  )
)
```

### Dwellings

As per investigation further below, dwelling ID are household ID are
identical in households dataset, but not in this data (assert id==hhID).
To link with households, hhID must be used. Will omit dwelling
coordinates from merged data.

``` r
data$Manchester$population[["dwellings"]] <- list(
  source = "manchester/synpop/sp_2021/dd_2021.csv",
  description = "A generated representation of Manchester's population characteristics, risks and outcomes (synthetic population).",
  citation = "?",
  variables = list(
    hhID = "household id",
    zone = "Output Area",
    type = "Dwelling type ((SFD: single-family detached, SFA: single-family attached, MF234: building with 2 to 4 units, MF5plus: building with 5 or more units)",
    bedrooms = "Number of bedrooms",
    quality = "Dwelling quality (1 to 4, being 1 top quality)",
    monthlyCost = "Rent (£/month)",
    yearBuilt = "Construction year",
    floor = "Floor area (m²)"
  )
)
```

### Jobs

``` r
data$Manchester$population[["jobs"]] <- list(
  source = "manchester/synpop/sp_2021/jj_2021.csv",
  description = "A generated representation of Greater Manchester's employment characteristics, risks and outcomes (synthetic population).",
  citation = "?",
  variables = list(
    id = "job id",
    zone = "Output Area",
    personId = "person id",
    type = "job type by industry"
  )
)
```

## Read in data

### population

``` r
synpop <- list()
for (key in names(data$Manchester$population)) {
  synpop[[key]] <- read_csv(paste0("../../../",data$Manchester$population[[key]]$source))
}
```

### Check population data

Household and dwelling ID appear identical, but we will confirm that
they share the same values and order and are therefore interchangeable
(and one is redundant and may be discarded!).

``` r
stopifnot(identical(synpop$households$id, synpop$households$dwelling))
```

This is true for the households data that household id and dwelling id
variables are identical.

The following code fails (informatively), so I have commented it out —
interpretation follows.

``` r
# stopifnot(identical(synpop$dwellings$id, synpop$dwellings$hhID))
```

Its not true for the dwellings data that dwelling id and household id
variables are identical… which makes things a bit awkward, as it implies
that linkage of one or the other may have an error.

So let’s look deeper – here is demonstration that household id and
dwelling id are identical for households data:

``` r
synpop$households[c("id","dwelling")] %>% summary()
##        id             dwelling      
##  Min.   :      1   Min.   :      1  
##  1st Qu.: 294548   1st Qu.: 294548  
##  Median : 589095   Median : 589095  
##  Mean   : 589095   Mean   : 589095  
##  3rd Qu.: 883642   3rd Qu.: 883642  
##  Max.   :1178189   Max.   :1178189
```

Here is demonstration of how they differ within the dwellings data:

``` r
synpop$dwellings[c("id","hhID")] %>% summary()
##        id               hhID        
##  Min.   :      1   Min.   :     -1  
##  1st Qu.: 304834   1st Qu.: 263688  
##  Median : 609668   Median : 568522  
##  Mean   : 609668   Mean   : 569216  
##  3rd Qu.: 914502   3rd Qu.: 873356  
##  Max.   :1219335   Max.   :1178189
```

So… the hhID variable approimately mathces the distribution seen in the
households dataset and may be able to link dwellings to the households
dataset (on either the id, or dwelling variables). Best to not use the
dwelling ID at all, however will check this with the team, to be sure
the right variables are used here and elsewhere.

The person ID variable `id` should be renamed to avoid ambiguity when
merging with jobs on person ID (`personId`).

``` r
synpop$persons <- synpop$persons %>% rename(personId = id)
names(synpop$persons)
##  [1] "personId"                 "hhid"                    
##  [3] "age"                      "gender"                  
##  [5] "relationShip"             "occupation"              
##  [7] "driversLicense"           "workplace"               
##  [9] "income"                   "disability"              
## [11] "schoolId"                 "totalTravelTime_sec"     
## [13] "totalActivityTime_min"    "totalTimeAtHome_min"     
## [15] "lightInjuryRisk"          "severeInjuryRisk"        
## [17] "fatalityRisk"             "mmetHr_walk"             
## [19] "mmetHr_cycle"             "exposure_pm25"           
## [21] "exposure_no2"             "exposure_normalised_pm25"
## [23] "exposure_normalised_no2"  "rr_walk"                 
## [25] "rr_cycle"                 "rr_pm25"                 
## [27] "rr_no2"                   "rr_all"
```

We should now be ready to join datasets \### Join population data

``` r
synpop[["merged"]] <- synpop$dwelling %>%
   left_join(synpop$households, by = c("hhID" = "id")) %>%
   right_join(synpop$persons, by = c("hhID" = "hhid")) %>%
   left_join(synpop$jobs, by = "personId")
```

Display a summary of the merged data

``` r
synpop$merged %>% summary()
##       id.x             zone.x        type.x               hhID        
##  Min.   :      1   Min.   :   1   Length:2827262     Min.   :      1  
##  1st Qu.: 286526   1st Qu.:2246   Class :character   1st Qu.: 286526  
##  Median : 566631   Median :4500   Mode  :character   Median : 566631  
##  Mean   : 576797   Mean   :4491                      Mean   : 576797  
##  3rd Qu.: 870327   3rd Qu.:6740                      3rd Qu.: 870327  
##  Max.   :1178189   Max.   :8966                      Max.   :1178189  
##                                                                       
##     bedrooms         quality       monthlyCost      yearBuilt     floor  
##  Min.   : 1.000   Min.   :1.000   Min.   :  311   Min.   :0   Min.   :0  
##  1st Qu.: 3.000   1st Qu.:2.000   1st Qu.:  868   1st Qu.:0   1st Qu.:0  
##  Median : 3.000   Median :3.000   Median : 1030   Median :0   Median :0  
##  Mean   : 3.097   Mean   :2.926   Mean   : 1114   Mean   :0   Mean   :0  
##  3rd Qu.: 3.000   3rd Qu.:3.000   3rd Qu.: 1226   3rd Qu.:0   3rd Qu.:0  
##  Max.   :13.000   Max.   :4.000   Max.   :26234   Max.   :0   Max.   :0  
##                                                                          
##     dwelling           hhSize           zone.y         autos      
##  Min.   :      1   Min.   : 1.000   Min.   :   1   Min.   :0.000  
##  1st Qu.: 286526   1st Qu.: 2.000   1st Qu.:2246   1st Qu.:1.000  
##  Median : 566631   Median : 3.000   Median :4500   Median :1.000  
##  Mean   : 576797   Mean   : 3.258   Mean   :4491   Mean   :1.288  
##  3rd Qu.: 870327   3rd Qu.: 4.000   3rd Qu.:6740   3rd Qu.:2.000  
##  Max.   :1178189   Max.   :12.000   Max.   :8966   Max.   :3.000  
##                                                                   
##     personId            age            gender      relationShip      
##  Min.   :      1   Min.   : 0.00   Min.   :1.000   Length:2827262    
##  1st Qu.: 706816   1st Qu.:19.00   1st Qu.:1.000   Class :character  
##  Median :1413632   Median :37.00   Median :2.000   Mode  :character  
##  Mean   :1413632   Mean   :38.38   Mean   :1.508                     
##  3rd Qu.:2120447   3rd Qu.:56.00   3rd Qu.:2.000                     
##  Max.   :2827262   Max.   :95.00   Max.   :2.000                     
##                                                                      
##    occupation    driversLicense    workplace           income      
##  Min.   :0.000   Mode :logical   Min.   :     -1   Min.   :     0  
##  1st Qu.:1.000   FALSE:904329    1st Qu.:     -1   1st Qu.:  5352  
##  Median :1.000   TRUE :1922933   Median :     -1   Median : 12468  
##  Mean   :1.894                   Mean   : 296450   Mean   : 17927  
##  3rd Qu.:3.000                   3rd Qu.: 575286   3rd Qu.: 24744  
##  Max.   :4.000                   Max.   :1357541   Max.   :270744  
##                                                                    
##    disability    schoolId  totalTravelTime_sec totalActivityTime_min
##  Min.   :0    Min.   :-1   Min.   :     0      Min.   : -206.3      
##  1st Qu.:0    1st Qu.:-1   1st Qu.:  5387      1st Qu.:  318.2      
##  Median :0    Median :-1   Median :  9943      Median : 1230.1      
##  Mean   :0    Mean   :-1   Mean   : 11583      Mean   : 1326.2      
##  3rd Qu.:0    3rd Qu.:-1   3rd Qu.: 15856      3rd Qu.: 1983.1      
##  Max.   :0    Max.   :-1   Max.   :221354      Max.   :13670.0      
##                                                                     
##  totalTimeAtHome_min lightInjuryRisk severeInjuryRisk  fatalityRisk
##  Min.   :    0       Min.   :0       Min.   :0        Min.   :0    
##  1st Qu.: 7849       1st Qu.:0       1st Qu.:0        1st Qu.:0    
##  Median : 8639       Median :0       Median :0        Median :0    
##  Mean   : 8561       Mean   :0       Mean   :0        Mean   :0    
##  3rd Qu.: 9619       3rd Qu.:0       3rd Qu.:0        3rd Qu.:0    
##  Max.   :10080       Max.   :0       Max.   :0        Max.   :0    
##                                                                    
##   mmetHr_walk        mmetHr_cycle      exposure_pm25     exposure_no2 
##  Min.   :  0.0000   Min.   :  0.0000   Min.   : 741.5   Min.   :1454  
##  1st Qu.:  0.6794   1st Qu.:  0.0000   1st Qu.: 785.2   1st Qu.:1645  
##  Median :  2.4934   Median :  0.0000   Median : 815.2   Median :1786  
##  Mean   :  3.4450   Mean   :  0.5732   Mean   : 827.1   Mean   :1833  
##  3rd Qu.:  5.0596   3rd Qu.:  0.0000   3rd Qu.: 855.1   3rd Qu.:1967  
##  Max.   :105.8128   Max.   :113.6398   Max.   :2328.4   Max.   :7980  
##                                                                       
##  exposure_normalised_pm25 exposure_normalised_no2    rr_walk      
##  Min.   : 8.887           Min.   :17.42           Min.   :0.7000  
##  1st Qu.: 9.410           1st Qu.:19.71           1st Qu.:0.9409  
##  Median : 9.770           Median :21.41           Median :0.9704  
##  Mean   : 9.913           Mean   :21.97           Mean   :0.9603  
##  3rd Qu.:10.248           3rd Qu.:23.58           3rd Qu.:0.9919  
##  Max.   :27.905           Max.   :95.63           Max.   :1.0000  
##                                                                   
##     rr_cycle         rr_pm25          rr_no2          rr_all     
##  Min.   :0.5500   Min.   :1.071   Min.   :1.035   Min.   :0.570  
##  1st Qu.:1.0000   1st Qu.:1.075   1st Qu.:1.040   1st Qu.:1.055  
##  Median :1.0000   Median :1.078   Median :1.043   Median :1.086  
##  Mean   :0.9934   Mean   :1.079   Mean   :1.044   Mean   :1.075  
##  3rd Qu.:1.0000   3rd Qu.:1.082   3rd Qu.:1.048   3rd Qu.:1.108  
##  Max.   :1.0000   Max.   :1.240   Max.   :1.209   Max.   :1.209  
##                                                                  
##       id.y              zone            type.y         
##  Min.   :      1   Min.   :   1      Length:2827262    
##  1st Qu.: 335764   1st Qu.:2530      Class :character  
##  Median : 674566   Median :4269      Mode  :character  
##  Mean   : 676358   Mean   :4467                        
##  3rd Qu.:1019687   3rd Qu.:6862                        
##  Max.   :1357541   Max.   :8966                        
##  NA's   :1588062   NA's   :1588062
```

Confirm that the zone variable from households and dwellings are
identical, as an extra check that this merge has worked as intended

``` r
stopifnot(identical(synpop$merged$zone.x,synpop$merged$zone.y))
```

While this has merged, I will need to check w/ team to confirm that hhId
is the correct variable to match dwellings.
