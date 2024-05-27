import { Card,Flex, View, Heading} from '@aws-amplify/ui-react';


export function Data() {
    return (
      <div>
      <Flex direction={{ base: 'column', large: 'row'}}>
        <View
          maxWidth={{ base: '300px', large: '400px'}}
          padding="1rem"
          >
            <Heading level={1} order={1}>Data</Heading>
            <Heading level={3}> An example list of data and options for download.  Once JIBE outputs are stored on FigShare, we may be able to programmatically access metadata and manipulate the display of these widgets (perhaps they appear in a dialog box, when you click a project component; something like that)</Heading>
         </View>
        <View 
          padding={{ base: '1rem', large: '1rem'}}
          width="100%"
          >
            <Card width="100%">
            <iframe src="https://widgets.figshare.com/articles/19586767/embed?show_title=1" width="100%" height="200" allowFullScreen frameBorder="0"></iframe>
            </Card>
            <Card>
            <iframe src="https://widgets.figshare.com/articles/15001230/embed?show_title=1" width="100%" height="351" allowFullScreen frameBorder="1"></iframe>
            </Card>
            <Card>
            <iframe src="https://widgets.figshare.com/articles/15001386/embed?show_title=1" width="100%" height="351" allowFullScreen frameBorder="0"></iframe>
            </Card>
        </View>
        </Flex>
      </div>
    );
  }