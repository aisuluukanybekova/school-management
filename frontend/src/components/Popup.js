import * as React from 'react';
import { useDispatch } from 'react-redux';
import { underControl } from '../redux/userRelated/userSlice';
import { underStudentControl } from '../redux/studentRelated/studentSlice';
import MuiAlert from '@mui/material/Alert';
import { Snackbar } from '@mui/material';

const Popup = ({ message, type = "info", setShowPopup, showPopup }) => {
    const dispatch = useDispatch();

    const vertical = "top";
    const horizontal = "right";

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setShowPopup(false);
        dispatch(underControl());
        dispatch(underStudentControl());
    };

    return (
        <Snackbar
            open={showPopup}
            autoHideDuration={2000}
            onClose={handleClose}
            anchorOrigin={{ vertical, horizontal }}
            key={vertical + horizontal}
        >
            <Alert onClose={handleClose} severity={type} sx={{ width: '100%' }}>
                {message === "error" ? "Произошла ошибка" : message}
            </Alert>
        </Snackbar>
    );
};

export default Popup;

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
