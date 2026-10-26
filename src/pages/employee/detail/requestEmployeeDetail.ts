import type { AppDispatch } from '@/store'
import { sagaActions } from '@/store/actions'
import {
  fetchEmployeeActivity,
  fetchEmployeeActivityFailure,
  fetchEmployeeActivitySuccess,
  fetchEmployeeDiscussion,
  fetchEmployeeDiscussionFailure,
  fetchEmployeeDiscussionSuccess,
  fetchEmployeeFollowups,
  fetchEmployeeFollowupsFailure,
  fetchEmployeeFollowupsSuccess,
  fetchEmployeeOrders,
  fetchEmployeeOrdersFailure,
  fetchEmployeeOrdersSuccess,
  fetchEmployeeTracking,
  setEmployeeTracking,
} from '@/store/slices/employeeDetailSlice'
import {
  mapHistory,
  mapTracking,
  mapUserActivities,
  type EmployeeHistoryData,
  type TrackingData,
  type UserActivitiesData,
} from '@/utils/employeeDetail'
import type { ApiResponse } from '@/utils/types'

export function requestEmployeeActivity(
  dispatch: AppDispatch,
  id: string,
  date: string,
) {
  dispatch(fetchEmployeeActivity({ id, date }))
  dispatch({
    type: sagaActions.GET_EMPLOYEE_ACTIVITY,
    payload: {
      query: `/history/${id}`,
      method: 'GET',
      variables: { date },
      onSuccess: (response: ApiResponse<EmployeeHistoryData>) => {
        dispatch(fetchEmployeeActivitySuccess({ id, ...mapHistory(response) }))
      },
      onFailure: (message: string) => {
        dispatch(fetchEmployeeActivityFailure({ id, message }))
      },
    },
  })
}

export function requestEmployeeTracking(
  dispatch: AppDispatch,
  id: string,
  date: string,
) {
  dispatch(fetchEmployeeTracking())
  dispatch({
    type: sagaActions.GET_EMPLOYEE_TRACKING,
    payload: {
      query: `/userTracking/${id}`,
      method: 'GET',
      variables: { date },
      onSuccess: (response: ApiResponse<TrackingData>) => {
        dispatch(
          setEmployeeTracking({ id, date, points: mapTracking(response) }),
        )
      },
      onFailure: () => {
        dispatch(setEmployeeTracking({ id, date, points: [] }))
      },
    },
  })
}

export function requestEmployeeDiscussion(dispatch: AppDispatch, id: string) {
  dispatch(fetchEmployeeDiscussion(id))
  dispatch({
    type: sagaActions.GET_EMPLOYEE_DISCUSSION,
    payload: {
      query: `/userActivities/user/${id}`,
      method: 'GET',
      variables: { event_type: 'discussion' },
      onSuccess: (response: ApiResponse<UserActivitiesData>) => {
        dispatch(
          fetchEmployeeDiscussionSuccess({
            id,
            items: mapUserActivities(response),
          }),
        )
      },
      onFailure: (message: string) => {
        dispatch(fetchEmployeeDiscussionFailure({ id, message }))
      },
    },
  })
}

export function requestEmployeeFollowups(dispatch: AppDispatch, id: string) {
  dispatch(fetchEmployeeFollowups(id))
  dispatch({
    type: sagaActions.GET_EMPLOYEE_FOLLOWUPS,
    payload: {
      query: `/userActivities/user/${id}`,
      method: 'GET',
      variables: { event_type: 'reminder' },
      onSuccess: (response: ApiResponse<UserActivitiesData>) => {
        dispatch(
          fetchEmployeeFollowupsSuccess({
            id,
            items: mapUserActivities(response),
          }),
        )
      },
      onFailure: (message: string) => {
        dispatch(fetchEmployeeFollowupsFailure({ id, message }))
      },
    },
  })
}

export function requestEmployeeOrders(
  dispatch: AppDispatch,
  id: string,
  fromDate: string,
  toDate: string,
) {
  dispatch(fetchEmployeeOrders({ id, fromDate, toDate }))
  dispatch({
    type: sagaActions.GET_EMPLOYEE_ORDERS,
    payload: {
      query: `/userActivities/user/${id}`,
      method: 'GET',
      variables: { event_type: 'order', startDate: fromDate, endDate: toDate },
      onSuccess: (response: ApiResponse<UserActivitiesData>) => {
        dispatch(
          fetchEmployeeOrdersSuccess({
            id,
            items: mapUserActivities(response),
          }),
        )
      },
      onFailure: (message: string) => {
        dispatch(fetchEmployeeOrdersFailure({ id, message }))
      },
    },
  })
}
