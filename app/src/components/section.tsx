import { Flex, View, Text, Heading} from '@aws-amplify/ui-react';

export function generic_section(section:string, heading:string, text:string, additional:any=null)  {
  return (
<section id={section}>
<Flex direction={{ base: 'column', large: 'row'}}>
  <View  
    minWidth={'570px'}
    maxWidth={{ base: '100%', large: '570px'}}
    padding="1rem"
    >
      {/* {TransportHealthImpacts("515","308")} */}
      <Heading level={1} order={1}>{heading}</Heading>
      {/* <Heading level={4}> Transport & Health Impacts is an interactive platform to inform healthy transport planning policy and localised infrastructure interventions, and visualise the impacts of modelled transportation scenarios</Heading> */}
      {additional?additional:""}
   </View>
  <View 
    padding={{ base: '1rem', large: '1rem'}}
    width="100%"
    marginTop={16}
    >
  <Text variation="primary">{text}</Text>
  </View>
  </Flex>
  </section>
  );
  }