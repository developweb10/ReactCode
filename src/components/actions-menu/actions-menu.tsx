import { useState } from "react";

import styles from "./actions-menu.module.scss";

import MoreVertIcon from "@material-ui/icons/MoreVert";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

interface MenuOption {
  id: number;
  content: () => string | number | JSX.Element | null;
  onClick: () => void;
}
interface ActionsMenuInterface {
  options: MenuOption[];
  disabled?: boolean;
}

export const ActionsMenu: React.FC<ActionsMenuInterface> = ({
  options,
  disabled,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div>
      <IconButton
        aria-label="actions"
        aria-controls="actions-menu"
        aria-haspopup="true"
        onClick={handleClick}
        className={styles.Button}
        disabled={disabled}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        elevation={0}
        PaperProps={{
          className: styles.Menu,
        }}
        disablePortal
      >
        {options.map((option) => (
          <MenuItem
            key={option.id}
            onClick={() => {
              handleClose();
              option.onClick();
            }}
          >
            {option.content()}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
