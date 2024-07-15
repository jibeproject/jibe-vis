import {Link} from 'react-router-dom';

export default function Error404() {
//   const error = useRouteError();
//   console.error(error+"Test");

  return (
    <div id="error-page">
    <h1>Uh oh, looks like this page can't be found.</h1>
    <p>Try navigating from our <Link to="/">home page</Link></p>
    </div>
  );
}