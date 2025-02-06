import { Button } from "@mantine/core";
import classes from "./css/Placeholder.module.css";

interface PlaceholderProps {
  pageName: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ pageName }) => {
  return (
    <div className={classes.root}>
      <div className={classes.label}>404</div>
      <div className={classes.title}>{pageName}</div>
      <div className={classes.description}>
        This is a placeholder page. This will be updated in the future!
      </div>
      <Button variant="outline" onClick={() => window.history.back()}>
        Go Back
      </Button>
    </div>
  );
};

export default Placeholder;
