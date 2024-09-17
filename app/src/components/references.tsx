import { Section } from './section';
import { Heading, Text } from '@aws-amplify/ui-react';
import { Link } from '@mui/material';


export function References() {
    return (
    <Section
    stub="resources"
    section="references"
    heading="References"
    subheading="Citations for resources and research used to inform and support the development of this website."
    subtext=""
    default_view={true}
    content={<>
    <Heading level={4}>Transport modelling</Heading>
    <Text>Jafari, A., Singh, D., Both, A., Abdollahyar, M., Gunn, L., Pemberton, S., & Giles-Corti, B. (2024). Activity-based and agent-based transport model of Melbourne: an open multi-modal transport simulation model for Greater Melbourne. Journal of Intelligent Transportation Systems, 1–18. <Link href="https://doi.org/10.1080/15472450.2024.2372894" target="_blank">https://doi.org/10.1080/15472450.2024.2372894</Link></Text>
    <Heading level={4}>Visualisation</Heading>
    <Text>Crameri, F. (2023). Scientific colour maps (8.0.1). Zenodo. <Link href = "https://doi.org/10.5281/zenodo.8409685" target="_blank">https://doi.org/10.5281/zenodo.8409685</Link></Text>
    <Heading level={4}>Interactive dashboards</Heading>
    <Text>Goodman, A. et al. (2019) ‘Scenarios of cycling to school in England, and associated health and carbon impacts: Application of the “Propensity to Cycle Tool”’, Journal of Transport & Health, 12, pp. 263–278. <Link href="https://doi.org/10.1016/j.jth.2019.01.008" target="_blank">https://doi.org/10.1016/j.jth.2019.01.008</Link>.</Text>
    <Text>Lovelace, R., Goodman, A., Aldred, R., Berkoff, N., Abbas, A., & Woodcock, J. (2017). The Propensity to Cycle Tool: An open source online system for sustainable transport planning. Journal of Transport and Land Use, 10(1)<Link href="https://doi.org/10.5198/jtlu.2016.862" target="_blank">https://doi.org/10.5198/jtlu.2016.862</Link>.</Text>
    </>
    }
    />
);
}