import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getUserDetails } from '../../../redux/userRelated/userHandle';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { updateStudentFields } from '../../../redux/studentRelated/studentHandle';

import {
    Box, InputLabel,
    MenuItem, Select,
    Typography, Stack,
    TextField, CircularProgress, FormControl
} from '@mui/material';
import { PurpleButton } from '../../../components/buttonStyles';
import Popup from '../../../components/Popup';

const StudentAttendance = ({ situation }) => {
    const dispatch = useDispatch();
    const { currentUser, userDetails, loading } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);
    const { response, error, statestatus } = useSelector((state) => state.student);
    const params = useParams()

    const [studentID, setStudentID] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [chosenSubName, setChosenSubName] = useState("");
    const [status, setStatus] = useState('');
    const [date, setDate] = useState('');

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    useEffect(() => {
        if (situation === "Student") {
            setStudentID(params.id);
            dispatch(getUserDetails(params.id, "Student"));
        } else if (situation === "Subject") {
            const { studentID, subjectID } = params
            setStudentID(studentID);
            dispatch(getUserDetails(studentID, "Student"));
            setChosenSubName(subjectID);
        }
    }, [situation]);

    useEffect(() => {
        if (userDetails?.sclassName && situation === "Student") {
            dispatch(getSubjectList(userDetails.sclassName._id, "ClassSubjects"));
        }
    }, [dispatch, userDetails]);

    const changeHandler = (event) => {
        const selectedSubject = subjectsList.find(
            (subject) => subject.subName === event.target.value
        );
        setSubjectName(selectedSubject.subName);
        setChosenSubName(selectedSubject._id);
    }

    const fields = { subName: chosenSubName, status, date }

    const submitHandler = (event) => {
        event.preventDefault()
        setLoader(true)
        dispatch(updateStudentFields(studentID, fields, "StudentAttendance"))
    }

    useEffect(() => {
        if (response) {
            setLoader(false)
            setShowPopup(true)
            setMessage(response)
        } else if (error) {
            setLoader(false)
            setShowPopup(true)
            setMessage("Произошла ошибка")
        } else if (statestatus === "added") {
            setLoader(false)
            setShowPopup(true)
            setMessage("Успешно добавлено")
        }
    }, [response, statestatus, error])

    return (
        <>
            {loading ? (
                <div>Загрузка...</div>
            ) : (
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
                                <Typography variant="h4">
                                    Ученик: {userDetails.name}
                                </Typography>
                                {currentUser?.teachSubject && (
                                    <Typography variant="h4">
                                        Предмет: {currentUser.teachSubject?.subName}
                                    </Typography>
                                )}
                            </Stack>
                            <form onSubmit={submitHandler}>
                                <Stack spacing={3}>
                                    {situation === "Student" && (
                                        <FormControl fullWidth>
                                            <InputLabel id="subject-select-label">Выберите предмет</InputLabel>
                                            <Select
                                                labelId="subject-select-label"
                                                id="subject-select"
                                                value={subjectName}
                                                label="Выберите предмет"
                                                onChange={changeHandler}
                                                required
                                            >
                                                {subjectsList?.length > 0 ? (
                                                    subjectsList.map((subject, index) => (
                                                        <MenuItem key={index} value={subject.subName}>
                                                            {subject.subName}
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem value="">Добавьте предметы</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                    )}
                                    <FormControl fullWidth>
                                        <InputLabel id="status-select-label">Статус посещаемости</InputLabel>
                                        <Select
                                            labelId="status-select-label"
                                            id="status-select"
                                            value={status}
                                            label="Статус посещаемости"
                                            onChange={(event) => setStatus(event.target.value)}
                                            required
                                        >
                                            <MenuItem value="Present">Присутствовал</MenuItem>
                                            <MenuItem value="Absent">Отсутствовал</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl>
                                        <TextField
                                            label="Дата"
                                            type="date"
                                            value={date}
                                            onChange={(event) => setDate(event.target.value)}
                                            required
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </FormControl>
                                </Stack>

                                <PurpleButton
                                    fullWidth
                                    size="large"
                                    sx={{ mt: 3 }}
                                    variant="contained"
                                    type="submit"
                                    disabled={loader}
                                >
                                    {loader ? <CircularProgress size={24} color="inherit" /> : "Сохранить"}
                                </PurpleButton>
                            </form>
                        </Box>
                    </Box>
                    <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
                </>
            )}
        </>
    )
}

export default StudentAttendance
