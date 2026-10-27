import { all, fork } from 'redux-saga/effects'
import { attendanceSaga } from './attendanceSaga'
import { authSaga } from './authSaga'
import { dashboardSaga } from './dashboardSaga'
import { profileSaga } from './profileSaga'
import { usersSaga } from './usersSaga'

export function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(attendanceSaga),
    fork(dashboardSaga),
    fork(profileSaga),
    fork(usersSaga),
  ])
}
