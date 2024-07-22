import { Heading, HeadingLevel } from '@aws-amplify/ui-react';
import { MdLink } from 'react-icons/md';
import { HashLink } from 'react-router-hash-link';
import './navheading.css';

export function NavHeading(props: {id: string, title: string, stub?: string, level?: HeadingLevel}) {
  return (
    <Heading level={props.level ?? 1} order={1} id={props.id}>
      <HashLink to={`/${props.stub ?? ''}#${props.id}`}>
        {props.title}
        <MdLink className="heading-link-icon"/>
      </HashLink>
    </Heading>
  );
}
