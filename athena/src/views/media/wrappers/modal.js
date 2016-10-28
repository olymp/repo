import React, { PropTypes } from 'react';
import { Modal, Button } from 'goodlook';
import Detail from '../detail';
import { withFile } from '../utils/with-file';

const component = props => {
  const { onClose, save } = props;
  const buttons = [
    <Button key="1" color="secondary" onClick={onClose}>Abbruch</Button>,
    <span key="1.5">&nbsp;</span>,
    <Button key="2" color="primary" onClick={() => save().then(onClose)}>Abschicken</Button>,
  ];
  return (
    <Modal title="Media" onClose={onClose} buttons={buttons}>
      <Detail {...props} />
    </Modal>
  );
};
component.propTypes = {
  onClose: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
};
export default withFile(component);
