using Drawing.Lines;
using Drawing.Lines.Types.Enums;
using Drawing.States;
using Lab3.Input.HoloLens;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Drawing
{
    public class HandDrawer3D : MonoBehaviour
    {
        [field: SerializeField] public GameObject LineParentGameObject { get; set; }
        [field: SerializeField] public GameObject LinePrefab { get; set; }
        [field: SerializeField] public GameObject DotPrefab { get; set; }

        [SerializeField] private Material _defaultLineMaterial;
        [SerializeField] public float minLineRadius = 0.001f;
        [SerializeField] public float maxLineRadius = 0.01f;

        [SerializeField] private BasicPinchController _pinchController;

        public event EventHandler LineUpdated;
        public event EventHandler LineFinished;
        public event EventHandler LinesRemoved;

        // public bool editing;

        public DrawingState IdleState { get; private set; }
        public DrawingState PencilState { get; private set; }

        public DrawingState CurrentState { get; set; }
        private List<DrawingState> _states;

        private readonly List<PencilLine> FinishedPencilLines = new List<PencilLine>();
        private readonly List<PencilLine> CurrentlyDrawnPencilLines = new List<PencilLine>();

        private void Start()
        {
            InitializeStates();
            SetUpPinchHandling();

            SetLineType(LineTypes.Freeform);
            SetLineMaterial(_defaultLineMaterial);
            SetLineRadius(0.5f * (maxLineRadius - minLineRadius) + minLineRadius);
        }

        public void AddStartedPencilLine(PencilLine line) => CurrentlyDrawnPencilLines.Add(line);

        public void AddFinishedPencilLine(PencilLine line)
        {
            CurrentlyDrawnPencilLines.Remove(line);
            FinishedPencilLines.Add(line);

            LineFinished?.Invoke(this, EventArgs.Empty);
        }

        public void SetLineType(LineTypes lineType) => _states.ForEach(state => state.CurrentLineType = lineType);

        public void SetLineMaterial(Material material) => _states.ForEach(state => state.CurrentMaterial = material);

        public void SetLineRadius(float radius) => _states.ForEach(state => state.CurrentRadius = radius);

        public void RemoveLastPencilLine()
        {
            if (FinishedPencilLines.Count <= 0) return;

            int index = FinishedPencilLines.Count - 1;
            FinishedPencilLines[index].RemoveLine();
            FinishedPencilLines.RemoveAt(index);

            LinesRemoved?.Invoke(this, EventArgs.Empty);
        }

        public void RemoveAllLines()
        {
            FinishedPencilLines.ForEach(line => line.RemoveLine());
            FinishedPencilLines.Clear();

            LinesRemoved?.Invoke(this, EventArgs.Empty);
        }

        public void ChangeState(DrawingState state) =>
            CurrentState = state; // TODO adjust so that only the states initialized in this class can be passed

        private void InitializeStates()
        {
            IdleState = new IdleDrawingState(this);
            PencilState = new PencilState(this);
            _states = new List<DrawingState> { IdleState, PencilState };

            CurrentState = IdleState;
        }

        private void SetUpPinchHandling()
        {
            _pinchController.PinchingEventHandler += (sender, args) =>
            {
                CurrentState.OnPinching(args.PinchPose);
                LineUpdated?.Invoke(this, EventArgs.Empty);
            };
            _pinchController.PinchEndedEventHandler += (sender, args) =>
            {
                CurrentState.OnPinchEnded();
                // if (editing)
                // {
                //     editing = false;
                //     StartCoroutine(DelayRemoval());
                // }
            };
        }
        
        // private IEnumerator DelayRemoval()
        // {
        //     yield return null;
        //     RemoveLastPencilLine();
        // }
    }
}