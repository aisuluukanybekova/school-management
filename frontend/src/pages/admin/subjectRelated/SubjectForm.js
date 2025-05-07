// New SubjectForm.js - Полностью правильная версия

import React, { useState, useEffect } from "react";
import { Button, TextField, Grid, Box, Typography, MenuItem, CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';
import axios from "axios";

axios.defaults.baseURL = 'http://localhost:5001';

const SubjectForm = () => {
    const [subjectName, setSubjectName] = useState("");
    const [classId, setClassId] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [sessionsPerWeek, setSessionsPerWeek] = useState("");
    const [weeksCount, setWeeksCount] = useState(8);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, response, error } = useSelector(state => state.user);

    const totalSessions = sessionsPerWeek && weeksCount ? sessionsPerWeek * weeksCount : 0;

  
        useEffect(() => {
            const fetchData = async () => {
              try {
                const classesRes = await axios.get('/api/sclasses');
                const teachersRes = await axios.get('/api/teachers');
                setClasses(classesRes.data);
                setTeachers(teachersRes.data);
              } catch (err) {
                console.error(err);
              }
            };
            fetchData();
          }, []);

    const submitHandler = (e) => {
        e.preventDefault();
        if (!subjectName || !classId || !teacherId || !sessionsPerWeek) {
            setMessage("Пожалуйста, заполните все поля");
            setShowPopup(true);
            return;
        }
        setLoader(true);
        const payload = {
            subjects: [{ subName: subjectName, sessions: totalSessions }],
            sclassName: classId,
            adminID: teacherId
        };
        dispatch(addStuff(payload, "Subject"));
    };

    useEffect(() => {
        if (status === 'added') {
            navigate("/Admin/subjects");
            dispatch(underControl());
            setLoader(false);
        } else if (status === 'failed' || status === 'error') {
            setMessage(response || "Ошибка сети");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, response, error, dispatch]);

    return (
        <form onSubmit={submitHandler}>
            <Box mb={2}>
                <Typography variant="h6">Добавить предмет</Typography>
            </Box>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        label="Название предмета"
                        fullWidth
                        required
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        select
                        label="Выбрать класс"
                        fullWidth
                        required
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                    >
                        {classes.map(c => (
                            <MenuItem key={c._id} value={c._id}>{c.sclassName}</MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        select
                        label="Выбрать учителя"
                        fullWidth
                        required
                        value={teacherId}
                        onChange={(e) => setTeacherId(e.target.value)}
                    >
                        {teachers.map(t => (
                            <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Занятий в неделю"
                        type="number"
                        fullWidth
                        required
                        inputProps={{ min: 1 }}
                        value={sessionsPerWeek}
                        onChange={(e) => setSessionsPerWeek(e.target.value)}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Количество недель"
                        type="number"
                        fullWidth
                        inputProps={{ min: 1 }}
                        value={weeksCount}
                        onChange={(e) => setWeeksCount(e.target.value)}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="subtitle1">Итоговое количество занятий: {totalSessions}</Typography>
                </Grid>

                <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end">
                        <Button variant="contained" color="primary" type="submit" disabled={loader}>
                            {loader ? <CircularProgress size={24} color="inherit" /> : 'Сохранить'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </form>
    );
};

export default SubjectForm;
