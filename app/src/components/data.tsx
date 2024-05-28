import { Card,Flex, View, Heading} from '@aws-amplify/ui-react';
import { CustomizedDialogs } from './dialog';

export function Data() {
    return (
      <div>
      <Flex direction={{ base: 'column', large: 'row'}}>
        <View
          maxWidth={{ base: '100%', large: '30%'}}
          padding="1rem"
          >
            <Heading level={1} order={1}>JIBE Data</Heading>
            <Heading level={4}> An example list of data and options for download.  Once JIBE outputs are stored on FigShare, we may be able to programmatically access metadata and manipulate the display of these widgets (perhaps they appear in a dialog box, when you click a project component; something like that)</Heading>
         </View>
        <View 
          padding={{ base: '1rem', large: '1rem'}}
          width="100%"
          >
            <Card>{ CustomizedDialogs("Melbourne street network (example research output placeholder)","19586767") }</Card>
            <Card>{ CustomizedDialogs("Example long list of outputs","15001230") }</Card>
            <Card>{ CustomizedDialogs("Example PDF output","20113526") }</Card>
            <Card>{ CustomizedDialogs("Example CSV output","23482613") }</Card>
            <Card>{ CustomizedDialogs("Example software output","14956209") }</Card>
            <Card>{ CustomizedDialogs("Example MP4 video","21708596") }</Card>
        </View>
        </Flex>
      </div>
    );
  }