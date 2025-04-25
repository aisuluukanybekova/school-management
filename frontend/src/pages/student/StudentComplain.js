import { useEffect, useState } from 'react';
import { Box, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import Popup from '../../components/Popup';
import { BlueButton } from '../../components/buttonStyles';
import { addStuff } from '../../redux/userRelated/userHandle';
import { useDispatch, useSelector } from 'react-redux';

const StudentComplain = () => {
    const [complaint, setComplaint] = useState("");
    const [date, setDate] = useState("");

    const dispatch = useDispatch();

    const { status, currentUser, error } = useSelector(state => state.user);

    const user = currentUser._id;
    const school = currentUser.school._id;
    const address = "Complain";

    const [loader, setLoader] = useState(false);
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const fields = {
        user,
        date,
        complaint,
        school,
    };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);
        dispatch(addStuff(fields, address));
    };

    useEffect(() => {
        if (status === "added") {
            setLoader(false);
            setShowPopup(true);
            setMessage("Жалоба отправлена успешно!");
            setComplaint("");
            setDate("");
        }
        else if (error) {
            setLoader(false);
            setShowPopup(true);
            setMessage("Ошибка сети. Попробуй позже 🫠");
        }
    }, [status, error]);

    return (
        <>
            <Box
                sx={{
                    flex: '1 1 auto',
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <Box
                    sx={{
                        maxWidth: 550,
                        px: 3,
                        py: '100px',
                        width: '100%'
                    }}
                >
                    <Stack spacing={1} sx={{ mb: 3 }}>
                        <Typography variant="h4">Оставить жалобу</Typography>
                        <Typography variant="body1" sx={{ color: "#666" }}>
                            Если что-то не так — обязательно напиши нам. Мы постараемся разобраться.
                        </Typography>
                    </Stack>
                    <form onSubmit={submitHandler}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Дата"
                                type="date"
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                                required
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Опиши проблему"
                                variant="outlined"
                                value={complaint}
                                onChange={(event) => setComplaint(event.target.value)}
                                required
                                multiline
                                maxRows={6}
                            />
                        </Stack>
                        <BlueButton
                            fullWidth
                            size="large"
                            sx={{ mt: 3 }}
                            variant="contained"
                            type="submit"
                            disabled={loader}
                        >
                            {loader ? <CircularProgress size={24} color="inherit" /> : "Отправить"}
                        </BlueButton>
                    </form>
                </Box>
            </Box>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default StudentComplain;
