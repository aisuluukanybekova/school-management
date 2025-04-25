import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Collapse, Table, TableBody, TableHead, Typography } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { calculateOverallAttendancePercentage, calculateSubjectAttendancePercentage, groupAttendanceBySubject } from '../../components/attendanceCalculator';
import CustomPieChart from '../../components/CustomPieChart';
import { PurpleButton } from '../../components/buttonStyles';
import { StyledTableCell, StyledTableRow } from '../../components/styles';

const TeacherViewStudent = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { currentUser, userDetails, response, loading, error } = useSelector((state) => state.user);

    const адрес = "Ученик";
    const ученикID = params.id;
    const предметУчителя = currentUser.teachSubject?.subName;
    const предметУчителяID = currentUser.teachSubject?._id;

    useEffect(() => {
        dispatch(getUserDetails(ученикID, адрес));
    }, [dispatch, ученикID]);

    if (response) { console.log(response); }
    else if (error) { console.log(error); }

    const [класс, setКласс] = useState('');
    const [школаУченика, setШколаУченика] = useState('');
    const [оценки, setОценки] = useState('');
    const [посещаемость, setПосещаемость] = useState([]);

    const [открытыеСостояния, setОткрытыеСостояния] = useState({});

    const открыть = (idПредмета) => {
        setОткрытыеСостояния((предыдущее) => ({
            ...предыдущее,
            [idПредмета]: !предыдущее[idПредмета],
        }));
    };

    useEffect(() => {
        if (userDetails) {
            setКласс(userDetails.sclassName || '');
            setШколаУченика(userDetails.school || '');
            setОценки(userDetails.examResult || '');
            setПосещаемость(userDetails.attendance || []);
        }
    }, [userDetails]);

    const общийПроцент = calculateOverallAttendancePercentage(посещаемость);
    const процентОтсутствий = 100 - общийПроцент;

    const данныеДиаграммы = [
        { name: 'Присутствовал', value: общийПроцент },
        { name: 'Отсутствовал', value: процентОтсутствий },
    ];

    return (
        <>
            {loading ? (
                <div>Загрузка...</div>
            ) : (
                <div>
                    Имя: {userDetails.name}
                    <br />
                    Номер зачётки: {userDetails.rollNum}
                    <br />
                    Класс: {класс.sclassName}
                    <br />
                    Школа: {школаУченика.schoolName}
                    <br /><br />

                    <h3>Посещаемость:</h3>
                    {посещаемость && Array.isArray(посещаемость) && посещаемость.length > 0 && (
                        <>
                            {Object.entries(groupAttendanceBySubject(посещаемость)).map(([названиеПредмета, { present, allData, subId, sessions }], index) => {
                                if (названиеПредмета === предметУчителя) {
                                    const процентПоПредмету = calculateSubjectAttendancePercentage(present, sessions);
                                    return (
                                        <Table key={index}>
                                            <TableHead>
                                                <StyledTableRow>
                                                    <StyledTableCell>Предмет</StyledTableCell>
                                                    <StyledTableCell>Присутствовал</StyledTableCell>
                                                    <StyledTableCell>Всего занятий</StyledTableCell>
                                                    <StyledTableCell>% посещаемости</StyledTableCell>
                                                    <StyledTableCell align="center">Действия</StyledTableCell>
                                                </StyledTableRow>
                                            </TableHead>
                                            <TableBody>
                                                <StyledTableRow>
                                                    <StyledTableCell>{названиеПредмета}</StyledTableCell>
                                                    <StyledTableCell>{present}</StyledTableCell>
                                                    <StyledTableCell>{sessions}</StyledTableCell>
                                                    <StyledTableCell>{процентПоПредмету}%</StyledTableCell>
                                                    <StyledTableCell align="center">
                                                        <Button variant="contained" onClick={() => открыть(subId)}>
                                                            {открытыеСостояния[subId] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}Детали
                                                        </Button>
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                                <StyledTableRow>
                                                    <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                                        <Collapse in={открытыеСостояния[subId]} timeout="auto" unmountOnExit>
                                                            <Box sx={{ margin: 1 }}>
                                                                <Typography variant="h6" gutterBottom component="div">
                                                                    Детали посещаемости
                                                                </Typography>
                                                                <Table size="small" aria-label="purchases">
                                                                    <TableHead>
                                                                        <StyledTableRow>
                                                                            <StyledTableCell>Дата</StyledTableCell>
                                                                            <StyledTableCell align="right">Статус</StyledTableCell>
                                                                        </StyledTableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {allData.map((data, index) => {
                                                                            const дата = new Date(data.date);
                                                                            const строкаДаты = дата.toString() !== "Invalid Date"
                                                                                ? дата.toISOString().substring(0, 10)
                                                                                : "Неверная дата";
                                                                            return (
                                                                                <StyledTableRow key={index}>
                                                                                    <StyledTableCell component="th" scope="row">
                                                                                        {строкаДаты}
                                                                                    </StyledTableCell>
                                                                                    <StyledTableCell align="right">{data.status}</StyledTableCell>
                                                                                </StyledTableRow>
                                                                            );
                                                                        })}
                                                                    </TableBody>
                                                                </Table>
                                                            </Box>
                                                        </Collapse>
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                            </TableBody>
                                        </Table>
                                    );
                                }
                                return null;
                            })}
                            <div>Общий процент посещаемости: {общийПроцент.toFixed(2)}%</div>
                            <CustomPieChart data={данныеДиаграммы} />
                        </>
                    )}

                    <br /><br />
                    <Button
                        variant="contained"
                        onClick={() => navigate(`/Teacher/class/student/attendance/${ученикID}/${предметУчителяID}`)}
                    >
                        Добавить посещаемость
                    </Button>

                    <br /><br /><br />
                    <h3>Оценки по предмету:</h3>
                    {оценки && Array.isArray(оценки) && оценки.length > 0 && (
                        <>
                            {оценки.map((результат, index) => {
                                if (результат.subName.subName === предметУчителя) {
                                    return (
                                        <Table key={index}>
                                            <TableHead>
                                                <StyledTableRow>
                                                    <StyledTableCell>Предмет</StyledTableCell>
                                                    <StyledTableCell>Оценка</StyledTableCell>
                                                </StyledTableRow>
                                            </TableHead>
                                            <TableBody>
                                                <StyledTableRow>
                                                    <StyledTableCell>{результат.subName.subName}</StyledTableCell>
                                                    <StyledTableCell>{результат.marksObtained}</StyledTableCell>
                                                </StyledTableRow>
                                            </TableBody>
                                        </Table>
                                    );
                                }
                                return null;
                            })}
                        </>
                    )}
                    <PurpleButton
                        variant="contained"
                        onClick={() => navigate(`/Teacher/class/student/marks/${ученикID}/${предметУчителяID}`)}
                    >
                        Добавить оценку
                    </PurpleButton>
                    <br /><br /><br />
                </div>
            )}
        </>
    );
};

export default TeacherViewStudent;
