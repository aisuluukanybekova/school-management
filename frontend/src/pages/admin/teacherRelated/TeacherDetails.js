import React, { useEffect } from 'react';
import { getTeacherDetails } from '../../../redux/teacherRelated/teacherHandle';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Button,
    Paper,
    Avatar,
    CircularProgress,
    Container
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ClassIcon from '@mui/icons-material/Class';
import styled from 'styled-components';

const TeacherDetails = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { loading, teacherDetails, error } = useSelector((state) => state.teacher);

    const teacherID = params.id;

    useEffect(() => {
        dispatch(getTeacherDetails(teacherID));
    }, [dispatch, teacherID]);

    if (error) console.error(error);

    const isSubjectNamePresent = teacherDetails?.teachSubject?.subName;

    const handleAddSubject = () => {
        navigate(`/Admin/teachers/choosesubject/${teacherDetails?.teachSclass?._id}/${teacherDetails?._id}`);
    };

    return (
        <Container maxWidth="sm">
            <StyledCard elevation={3}>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box p={3}>
                        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                            <Avatar sx={{ width: 80, height: 80, mb: 1 }}>
                                {teacherDetails?.name?.charAt(0)}
                            </Avatar>
                            <Typography variant="h5" gutterBottom>
                                {teacherDetails?.name}
                            </Typography>
                        </Box>

                        <InfoRow>
                            <ClassIcon color="primary" />
                            <Typography variant="subtitle1" ml={1}>
                                Класс: <strong>{teacherDetails?.teachSclass?.sclassName}</strong>
                            </Typography>
                        </InfoRow>

                        {isSubjectNamePresent ? (
                            <>
                                <InfoRow>
                                    <MenuBookIcon color="primary" />
                                    <Typography variant="subtitle1" ml={1}>
                                        Предмет: <strong>{teacherDetails?.teachSubject?.subName}</strong>
                                    </Typography>
                                </InfoRow>
                                <InfoRow>
                                    <SchoolIcon color="primary" />
                                    <Typography variant="subtitle1" ml={1}>
                                        Кол-во занятий: <strong>{teacherDetails?.teachSubject?.sessions}</strong>
                                    </Typography>
                                </InfoRow>
                            </>
                        ) : (
                            <Box mt={3} textAlign="center">
                                <Button variant="contained" onClick={handleAddSubject}>
                                    Добавить предмет
                                </Button>
                            </Box>
                        )}
                    </Box>
                )}
            </StyledCard>
        </Container>
    );
};

export default TeacherDetails;

const StyledCard = styled(Paper)`
  margin-top: 40px;
  padding: 24px;
  border-radius: 16px;
`;

const InfoRow = styled(Box)`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;
